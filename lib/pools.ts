'use server'

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pool,
  poolActivity,
  poolMessage,
  poolParticipant,
  poolPriceTier,
  poolSupplierBid,
  notification,
  user,
} from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

const milestonePercents = [60, 80, 92, 100, 120];

const parseNumber = (value: FormDataEntryValue | null, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseCurrency = (value: FormDataEntryValue | null) => {
  const str = typeof value === "string" ? value.trim().toUpperCase() : "USD";
  return str || "USD";
};

const toCents = (value: number) => Math.round(value * 100);

async function getAuthedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function createPool(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    throw new Error("Not authenticated");
  }

  const title = String(formData.get("title") || "").trim();
  const material = String(formData.get("material") || "").trim();
  const specification = String(formData.get("specification") || "").trim();
  const unit = String(formData.get("unit") || "kg").trim();
  const targetQuantity = parseNumber(formData.get("targetQuantity"));
  const initialQuantity = parseNumber(formData.get("initialQuantity"));
  const minFillPercent = parseNumber(formData.get("minFillPercent"), 60);
  const retailPrice = parseNumber(formData.get("retailPrice"));
  const currency = parseCurrency(formData.get("currency"));
  const locationCity = String(formData.get("locationCity") || "").trim();
  const locationState = String(formData.get("locationState") || "").trim();
  const locationCountry = String(formData.get("locationCountry") || "").trim();

  if (!title || !material || !targetQuantity || !retailPrice) {
    throw new Error("Please provide required pool details.");
  }

  const poolId = randomUUID();
  const retailPriceCents = toCents(retailPrice);

  const tier1Percent = parseNumber(formData.get("tier1Percent"), 60);
  const tier2Percent = parseNumber(formData.get("tier2Percent"), 80);
  const tier3Percent = parseNumber(formData.get("tier3Percent"), 100);
  const tier1Price = parseNumber(formData.get("tier1Price"), retailPrice * 0.95);
  const tier2Price = parseNumber(formData.get("tier2Price"), retailPrice * 0.9);
  const tier3Price = parseNumber(formData.get("tier3Price"), retailPrice * 0.85);

  const tiers = [
    { minPercent: tier1Percent, pricePerUnitCents: toCents(tier1Price) },
    { minPercent: tier2Percent, pricePerUnitCents: toCents(tier2Price) },
    { minPercent: tier3Percent, pricePerUnitCents: toCents(tier3Price) },
  ].filter((tier) => tier.minPercent > 0 && tier.pricePerUnitCents > 0);

  await db.transaction(async (tx) => {
    await tx.insert(pool).values({
      id: poolId,
      creatorId: authedUser.id,
      title,
      material,
      specification: specification || null,
      unit,
      targetQuantity,
      currentQuantity: initialQuantity,
      minFillPercent,
      status: initialQuantity >= targetQuantity ? "locked" : "filling",
      retailPriceCents,
      currency,
      locationCity: locationCity || null,
      locationState: locationState || null,
      locationCountry: locationCountry || null,
    });

    await tx.insert(poolPriceTier).values(
      tiers.map((tier) => ({
        id: randomUUID(),
        poolId,
        minPercent: tier.minPercent,
        pricePerUnitCents: tier.pricePerUnitCents,
        currency,
      }))
    );

    if (initialQuantity > 0) {
      await tx.insert(poolParticipant).values({
        id: randomUUID(),
        poolId,
        userId: authedUser.id,
        quantity: initialQuantity,
        participantType: "buyer",
      });
    }

    await tx.insert(poolActivity).values({
      id: randomUUID(),
      poolId,
      type: "created",
      message: `Pool created by ${authedUser.name || authedUser.email}`,
    });
  });

  await logAudit({
    actorId: authedUser.id,
    action: "pool.created",
    entityType: "pool",
    entityId: poolId,
    metadata: { title, material, targetQuantity },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/pools/${poolId}`);

  return;
}

export async function joinPool(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    throw new Error("Not authenticated");
  }

  const poolId = String(formData.get("poolId") || "").trim();
  const quantity = parseNumber(formData.get("quantity"));
  const commit = String(formData.get("commit") || "").trim() === "true";
  const splitExcess = String(formData.get("splitExcess") || "").trim() === "true";

  if (!poolId || quantity <= 0) {
    throw new Error("Invalid pool join request.");
  }

  const existingPool = await db.query.pool.findFirst({
    where: eq(pool.id, poolId),
  });

  if (!existingPool) {
    throw new Error("Pool not found.");
  }

  const prevProgress = (existingPool.currentQuantity / existingPool.targetQuantity) * 100;
  const rawNextQuantity = existingPool.currentQuantity + quantity;
  const overflow = Math.max(rawNextQuantity - existingPool.targetQuantity, 0);
  const nextQuantity = splitExcess && overflow > 0 ? existingPool.targetQuantity : rawNextQuantity;
  const nextProgress = (nextQuantity / existingPool.targetQuantity) * 100;

  await db.transaction(async (tx) => {
    const existingParticipant = await tx.query.poolParticipant.findFirst({
      where: and(eq(poolParticipant.poolId, poolId), eq(poolParticipant.userId, authedUser.id)),
    });

    if (existingParticipant) {
      await tx
        .update(poolParticipant)
        .set({
          quantity: existingParticipant.quantity + quantity,
          commitStatus: commit ? "soft" : existingParticipant.commitStatus,
          committedAt: commit ? new Date() : existingParticipant.committedAt,
        })
        .where(eq(poolParticipant.id, existingParticipant.id));
    } else {
      await tx.insert(poolParticipant).values({
        id: randomUUID(),
        poolId,
        userId: authedUser.id,
        quantity,
        participantType: "buyer",
        commitStatus: commit ? "soft" : "none",
        committedAt: commit ? new Date() : null,
      });
    }

    await tx
      .update(pool)
      .set({
        currentQuantity: nextQuantity,
        status: nextQuantity >= existingPool.targetQuantity ? "locked" : "filling",
      })
      .where(eq(pool.id, poolId));

    await tx.insert(poolActivity).values({
      id: randomUUID(),
      poolId,
      type: "joined",
      message: `${authedUser.name || authedUser.email} joined with ${quantity}${existingPool.unit}${commit ? " (soft commit)" : ""}`,
    });

    const participantUsers = await tx.query.poolParticipant.findMany({
      where: eq(poolParticipant.poolId, poolId),
      columns: { userId: true },
    });

    for (const milestone of milestonePercents) {
      if (prevProgress < milestone && nextProgress >= milestone) {
        const activityId = randomUUID();
        const msg = `Pool reached ${milestone}% capacity.`;

        await tx.insert(poolActivity).values({
          id: activityId,
          poolId,
          type: "milestone",
          message: msg,
        });

        if (participantUsers.length) {
          await tx.insert(notification).values(
            participantUsers.map((row) => ({
              id: randomUUID(),
              userId: row.userId,
              type: "pool",
              title: `Pool milestone: ${milestone}%`,
              body: msg,
              href: `/pools/${poolId}`,
            })),
          );
        }
      }
    }

    if (splitExcess && overflow > 0) {
      const overflowId = randomUUID();
      await tx.insert(pool).values({
        id: overflowId,
        creatorId: existingPool.creatorId,
        title: `${existingPool.title} (Overflow)`,
        material: existingPool.material,
        specification: existingPool.specification,
        unit: existingPool.unit,
        targetQuantity: existingPool.targetQuantity,
        currentQuantity: overflow,
        minFillPercent: existingPool.minFillPercent,
        status: "filling",
        retailPriceCents: existingPool.retailPriceCents,
        currency: existingPool.currency,
        locationCity: existingPool.locationCity,
        locationState: existingPool.locationState,
        locationCountry: existingPool.locationCountry,
      });

      const existingTiers = await tx.query.poolPriceTier.findMany({
        where: eq(poolPriceTier.poolId, poolId),
      });

      if (existingTiers.length) {
        await tx.insert(poolPriceTier).values(
          existingTiers.map((t) => ({
            id: randomUUID(),
            poolId: overflowId,
            minPercent: t.minPercent,
            pricePerUnitCents: t.pricePerUnitCents,
            currency: t.currency,
          })),
        );
      }

      await tx.insert(poolParticipant).values({
        id: randomUUID(),
        poolId: overflowId,
        userId: authedUser.id,
        quantity: overflow,
        participantType: "buyer",
        commitStatus: commit ? "soft" : "none",
        committedAt: commit ? new Date() : null,
      });

      await tx.insert(poolActivity).values({
        id: randomUUID(),
        poolId,
        type: "split",
        message: `Overflow of ${overflow}${existingPool.unit} created as a new pool.`,
      });

      await tx.insert(poolActivity).values({
        id: randomUUID(),
        poolId: overflowId,
        type: "created",
        message: `Overflow pool created from ${poolId}.`,
      });
    }
  });

  await logAudit({
    actorId: authedUser.id,
    action: "pool.joined",
    entityType: "pool",
    entityId: poolId,
    metadata: { quantity, commit, splitExcess },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/pools/${poolId}`);

  return;
}

function getCurrentPriceCents(
  retailPriceCents: number,
  tiers: { minPercent: number; pricePerUnitCents: number }[],
  progressPercent: number,
) {
  const sorted = [...tiers].sort((a, b) => a.minPercent - b.minPercent);
  let price = retailPriceCents;

  sorted.forEach((tier) => {
    if (progressPercent >= tier.minPercent) {
      price = tier.pricePerUnitCents;
    }
  });

  return price;
}

export async function getBuyerDashboardData() {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    return { stats: null, myPools: [], availablePools: [], activity: [] };
  }

  const participantRows = await db.query.poolParticipant.findMany({
    where: eq(poolParticipant.userId, authedUser.id),
    with: {
      pool: {
        with: {
          priceTiers: true,
          participants: true,
        },
      },
    },
  });

  const myPoolIds = participantRows.map((row) => row.poolId);

  const myPools = participantRows.map((row) => {
    const poolRecord = row.pool;
    const progress = poolRecord.targetQuantity
      ? (poolRecord.currentQuantity / poolRecord.targetQuantity) * 100
      : 0;
    const currentPriceCents = getCurrentPriceCents(
      poolRecord.retailPriceCents,
      poolRecord.priceTiers.map((tier) => ({
        minPercent: tier.minPercent,
        pricePerUnitCents: tier.pricePerUnitCents,
      })),
      progress,
    );

    return {
      id: poolRecord.id,
      title: poolRecord.title,
      material: poolRecord.material,
      specification: poolRecord.specification,
      unit: poolRecord.unit,
      status: poolRecord.status,
      targetQuantity: poolRecord.targetQuantity,
      currentQuantity: poolRecord.currentQuantity,
      progress,
      currentPriceCents,
      retailPriceCents: poolRecord.retailPriceCents,
      currency: poolRecord.currency,
      participantsCount: poolRecord.participants.length,
      location: [poolRecord.locationCity, poolRecord.locationState, poolRecord.locationCountry]
        .filter(Boolean)
        .join(", "),
    };
  });

  const availablePools = await db.query.pool.findMany({
    where: and(
      eq(pool.status, "filling"),
      myPoolIds.length ? notInArray(pool.id, myPoolIds) : sql`1=1`,
    ),
    with: {
      priceTiers: true,
      participants: true,
    },
    orderBy: (fields) => [desc(fields.createdAt)],
    limit: 6,
  });

  const available = availablePools.map((poolRecord) => {
    const progress = poolRecord.targetQuantity
      ? (poolRecord.currentQuantity / poolRecord.targetQuantity) * 100
      : 0;
    const currentPriceCents = getCurrentPriceCents(
      poolRecord.retailPriceCents,
      poolRecord.priceTiers.map((tier) => ({
        minPercent: tier.minPercent,
        pricePerUnitCents: tier.pricePerUnitCents,
      })),
      progress,
    );

    return {
      id: poolRecord.id,
      title: poolRecord.title,
      material: poolRecord.material,
      specification: poolRecord.specification,
      unit: poolRecord.unit,
      status: poolRecord.status,
      targetQuantity: poolRecord.targetQuantity,
      currentQuantity: poolRecord.currentQuantity,
      progress,
      currentPriceCents,
      retailPriceCents: poolRecord.retailPriceCents,
      currency: poolRecord.currency,
      participantsCount: poolRecord.participants.length,
      location: [poolRecord.locationCity, poolRecord.locationState, poolRecord.locationCountry]
        .filter(Boolean)
        .join(", "),
    };
  });

  const activity = myPoolIds.length
    ? await db.query.poolActivity.findMany({
      where: inArray(poolActivity.poolId, myPoolIds),
      orderBy: (fields) => [desc(fields.createdAt)],
      limit: 8,
    })
    : [];

  const stats = myPools.reduce(
    (acc, poolRecord) => {
      const savingsPerUnit = poolRecord.retailPriceCents - poolRecord.currentPriceCents;
      const quantity = poolRecord.currentQuantity;
      acc.totalSavingsCents += Math.max(savingsPerUnit, 0) * quantity;
      acc.activePools += poolRecord.status === "filling" ? 1 : 0;
      acc.lockedPools += poolRecord.status === "locked" ? 1 : 0;
      return acc;
    },
    { totalSavingsCents: 0, activePools: 0, lockedPools: 0 },
  );

  return { stats, myPools, availablePools: available, activity };
}

export async function getPoolDetails(poolId: string) {
  const poolRecord = await db.query.pool.findFirst({
    where: eq(pool.id, poolId),
    with: {
      priceTiers: true,
      participants: {
        with: {
          user: true,
        },
      },
      activities: {
        orderBy: (fields) => [desc(fields.createdAt)],
        limit: 20,
      },
      messages: {
        with: {
          sender: true,
        },
        orderBy: (fields) => [desc(fields.createdAt)],
        limit: 50,
      },
      supplierBids: {
        with: {
          supplier: true,
        },
        orderBy: (fields) => [desc(fields.createdAt)],
        limit: 25,
      },
    },
  });

  if (!poolRecord) return null;

  const progress = poolRecord.targetQuantity
    ? (poolRecord.currentQuantity / poolRecord.targetQuantity) * 100
    : 0;
  const currentPriceCents = getCurrentPriceCents(
    poolRecord.retailPriceCents,
    poolRecord.priceTiers.map((tier) => ({
      minPercent: tier.minPercent,
      pricePerUnitCents: tier.pricePerUnitCents,
    })),
    progress,
  );

  return {
    ...poolRecord,
    progress,
    currentPriceCents,
  };
}

export type PoolDetails = NonNullable<Awaited<ReturnType<typeof getPoolDetails>>>;

export async function sendPoolMessage(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    throw new Error("Not authenticated");
  }

  const poolId = String(formData.get("poolId") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const isAnonymous = String(formData.get("anonymous") || "").trim() === "true";
  const displayName = String(formData.get("displayName") || "").trim();

  if (!poolId || !message) {
    throw new Error("Message cannot be empty.");
  }

  const msgId = randomUUID();

  await db.insert(poolMessage).values({
    id: msgId,
    poolId,
    senderId: authedUser.id,
    senderRole: authedUser.role || "buyer",
    isAnonymous,
    displayName: isAnonymous ? (displayName || "Anonymous") : null,
    message,
  });

  await logAudit({
    actorId: authedUser.id,
    action: "pool.message.sent",
    entityType: "pool_message",
    entityId: msgId,
    metadata: { poolId, isAnonymous },
  });

  revalidatePath(`/pools/${poolId}`);
}

export async function submitSupplierBid(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) throw new Error("Not authenticated");
  if (authedUser.role !== "supplier" && authedUser.role !== "admin") {
    throw new Error("Only suppliers can submit bids.");
  }

  const poolId = String(formData.get("poolId") || "").trim();
  const offeredPrice = parseNumber(formData.get("offeredPrice"));
  const currency = parseCurrency(formData.get("currency"));
  const maxQuantity = parseNumber(formData.get("maxQuantity"), 0);
  const notes = String(formData.get("notes") || "").trim();

  if (!poolId || offeredPrice <= 0) {
    throw new Error("Invalid bid");
  }

  const bidId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(poolSupplierBid).values({
      id: bidId,
      poolId,
      supplierId: authedUser.id,
      offeredPriceCents: toCents(offeredPrice),
      currency,
      maxQuantity: maxQuantity > 0 ? maxQuantity : null,
      notes: notes || null,
      status: "open",
    });

    await tx.insert(poolActivity).values({
      id: randomUUID(),
      poolId,
      type: "supplier_bid",
      message: `Supplier ${authedUser.name || authedUser.email} submitted an offer.`,
    });

    const buyers = await tx.query.poolParticipant.findMany({
      where: eq(poolParticipant.poolId, poolId),
      columns: { userId: true },
    });

    if (buyers.length) {
      await tx.insert(notification).values(
        buyers.map((row) => ({
          id: randomUUID(),
          userId: row.userId,
          type: "pool",
          title: "New supplier offer",
          body: "A supplier submitted a bid for your pool.",
          href: `/pools/${poolId}`,
        })),
      );
    }
  });

  await logAudit({
    actorId: authedUser.id,
    action: "pool.bid.submitted",
    entityType: "pool_bid",
    entityId: bidId,
    metadata: { poolId },
  });

  revalidatePath(`/pools/${poolId}`);
}

export async function getPoolLiveState(poolId: string) {
  return getPoolDetails(poolId);
}
