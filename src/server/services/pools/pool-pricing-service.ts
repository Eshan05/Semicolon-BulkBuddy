import { prisma } from "../../data/prisma/client";
import { errors } from "../../shared/errors";
import type { Prisma } from "@prisma/client";

/**
 * Concurrency-safe pool join.
 *
 * Contract:
 * - Upserts a pool member (idempotent for (poolId,userId))
 * - Recomputes pool total quantity
 * - Applies the best eligible tier exactly once (PoolPriceEvent unique)
 * - Updates unitPricePaise snapshots for all active members
 *
 * Transaction notes:
 * - Uses SERIALIZABLE isolation to prevent write skew on concurrent joins.
 * - Uses unique constraints for idempotency:
 *   - pool_members(poolId,userId)
 *   - pool_price_events(poolId,pricingTierId)
 */
export async function joinPoolAndReprice(input: {
  businessId: string;
  poolId: string;
  userId: string;
  quantity: number;
}) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw errors.validation("Quantity must be a positive integer");
  }

  return prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const pool = await tx.pool.findFirst({
        where: { id: input.poolId, businessId: input.businessId, deletedAt: null },
        select: { id: true, productId: true, appliedTierId: true, totalQuantity: true, status: true },
      });
      if (!pool) throw errors.notFound("Pool not found");
      if (pool.status !== "OPEN") throw errors.conflict("Pool is not open");

      await tx.poolMember.upsert({
        where: { poolId_userId: { poolId: input.poolId, userId: input.userId } },
        update: { quantity: input.quantity, deletedAt: null },
        create: {
          poolId: input.poolId,
          userId: input.userId,
          quantity: input.quantity,
          unitPricePaise: 0, // set below after tier selection
        },
      });

      // Recompute total from active members (soft delete aware)
      const aggregate = await tx.poolMember.aggregate({
        where: { poolId: input.poolId, deletedAt: null },
        _sum: { quantity: true },
      });
      const newTotal = aggregate._sum.quantity ?? 0;

      // Load tiers (ascending by threshold) and pick best eligible
      const tiers = await tx.pricingTier.findMany({
        where: { productId: pool.productId, deletedAt: null },
        orderBy: [{ thresholdQuantity: "asc" }, { sortOrder: "asc" }],
        select: { id: true, thresholdQuantity: true, unitPricePaise: true },
      });
      if (tiers.length === 0) throw errors.conflict("No pricing tiers configured");

      let bestTier = tiers[0];
      for (const tier of tiers) {
        if (newTotal >= tier.thresholdQuantity) bestTier = tier;
      }

      // Apply price event idempotently (unique constraint makes this safe)
      await tx.poolPriceEvent.upsert({
        where: { poolId_pricingTierId: { poolId: input.poolId, pricingTierId: bestTier.id } },
        update: {},
        create: { poolId: input.poolId, pricingTierId: bestTier.id },
      });

      // Update pool applied tier pointer and denormalized total
      await tx.pool.update({
        where: { id: input.poolId },
        data: { totalQuantity: newTotal, appliedTierId: bestTier.id },
      });

      // Update all member snapshots to current unit price
      await tx.poolMember.updateMany({
        where: { poolId: input.poolId, deletedAt: null },
        data: { unitPricePaise: bestTier.unitPricePaise },
      });

      return {
        poolId: input.poolId,
        totalQuantity: newTotal,
        appliedTier: {
          id: bestTier.id,
          thresholdQuantity: bestTier.thresholdQuantity,
          unitPricePaise: bestTier.unitPricePaise,
        },
      };
    },
    { isolationLevel: "Serializable" }
  );
}
