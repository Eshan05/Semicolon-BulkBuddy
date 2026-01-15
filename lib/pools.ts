'use server'

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeProgressPercent, getCurrentPriceCents } from "@/lib/pricing";
import {
  pool,
  poolActivity,
  poolMessage,
  poolParticipant,
  poolPriceTier,
  poolSupplierBid,
  poolVibeCheck,
  notification,
  auditLog,
  user,
  companyProfile,
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

export type ActionResult = { ok: true } | { ok: false; error: string };

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong";
}

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
  const anonymousJoin = String(formData.get("anonymousJoin") || "").trim() === "true";
  const displayName = String(formData.get("displayName") || "").trim();
  const specNotes = String(formData.get("specNotes") || "").trim();
  const referralTag = String(formData.get("ref") || "").trim();

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

  const pushedOverTarget = prevProgress < 100 && nextProgress >= 100;

  await db.transaction(async (tx) => {
    const existingParticipant = await tx.query.poolParticipant.findFirst({
      where: and(eq(poolParticipant.poolId, poolId), eq(poolParticipant.userId, authedUser.id)),
    });

    if (existingParticipant) {
      await tx
        .update(poolParticipant)
        .set({
          quantity: existingParticipant.quantity + quantity,
          isAnonymous: existingParticipant.isAnonymous || anonymousJoin,
          displayName: (existingParticipant.isAnonymous || anonymousJoin)
            ? (displayName || existingParticipant.displayName)
            : existingParticipant.displayName,
          specNotes: specNotes ? specNotes : existingParticipant.specNotes,
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
        isAnonymous: anonymousJoin,
        displayName: anonymousJoin ? (displayName || "Anonymous") : null,
        specNotes: specNotes || null,
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
      message: `${anonymousJoin ? "An anonymous buyer" : (authedUser.name || authedUser.email)} joined with ${quantity}${existingPool.unit}${commit ? " (soft commit)" : ""}`,
    });

    const participantUsers = await tx.query.poolParticipant.findMany({
      where: eq(poolParticipant.poolId, poolId),
      columns: { userId: true },
    });

    if (pushedOverTarget) {
      const msg = `Pool locked at ${nextQuantity}${existingPool.unit}.`;

      await tx.insert(poolActivity).values({
        id: randomUUID(),
        poolId,
        type: "locked",
        message: msg,
      });

      if (participantUsers.length) {
        await tx.insert(notification).values(
          participantUsers.map((row) => ({
            id: randomUUID(),
            userId: row.userId,
            type: "pool",
            title: "Pool locked",
            body: msg,
            href: `/pools/${poolId}`,
          })),
        );
      }

      await tx.insert(notification).values({
        id: randomUUID(),
        userId: authedUser.id,
        type: "pool",
        title: "You closed the pool",
        body: "Your join pushed the pool over 100%. Nice one.",
        href: `/pools/${poolId}`,
      });
    }

    for (const milestone of milestonePercents) {
      if (prevProgress < milestone && nextProgress >= milestone) {
        const activityId = randomUUID();
        const remaining = Math.max(existingPool.targetQuantity - nextQuantity, 0);
        const msg = remaining > 0
          ? `Pool @${milestone}% — just ${remaining}${existingPool.unit} to reach 100%.`
          : `Pool reached ${milestone}% capacity.`;

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
    metadata: {
      quantity,
      commit,
      splitExcess,
      anonymousJoin,
      prevProgress,
      nextProgress,
      pushedOverTarget,
      joinedNearClose: prevProgress >= 80,
    },
  });

  const ref = referralTag && referralTag !== authedUser.id ? referralTag : null;
  if (ref) {
    const refUser = await db.query.user.findFirst({
      where: eq(user.id, ref),
      columns: { id: true },
    });

    if (refUser?.id) {
      await db.insert(notification).values({
        id: randomUUID(),
        userId: refUser.id,
        type: "pool",
        title: "Referral joined a pool",
        body: "Someone joined a pool via your link.",
        href: `/pools/${poolId}`,
      });

      await logAudit({
        actorId: refUser.id,
        action: "referral.earned",
        entityType: "pool",
        entityId: poolId,
        metadata: { fromUserId: authedUser.id },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/pools/${poolId}`);

  return;
}

export async function getBuyerDashboardData(scopeInput?: string | null) {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    return {
      stats: null,
      myPools: [],
      availablePools: [],
      activity: [],
      scope: "all" as const,
      locationLabel: null as string | null,
    };
  }

  if (authedUser.role !== "buyer" && authedUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const scope = ((): "all" | "country" | "state" | "city" => {
    const normalized = String(scopeInput || "").trim().toLowerCase();
    if (normalized === "all") return "all";
    if (normalized === "state") return "state";
    if (normalized === "city") return "city";
    return "country";
  })();

  const company = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, authedUser.id),
    columns: { city: true, state: true, country: true },
  });

  const locationLabel = company
    ? [company.city, company.state, company.country].filter(Boolean).join(", ")
    : null;

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
    const progress = computeProgressPercent(poolRecord.currentQuantity, poolRecord.targetQuantity);
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

  const locationWhere = (() => {
    if (scope === "all") return sql`1=1`;
    if (!company?.country) return sql`1=1`;
    if (scope === "country") return eq(pool.locationCountry, company.country);
    if (scope === "state") {
      return and(
        eq(pool.locationCountry, company.country),
        company.state ? eq(pool.locationState, company.state) : sql`1=1`,
      );
    }
    return and(
      eq(pool.locationCountry, company.country),
      company.state ? eq(pool.locationState, company.state) : sql`1=1`,
      company.city ? eq(pool.locationCity, company.city) : sql`1=1`,
    );
  })();

  const availablePools = await db.query.pool.findMany({
    where: and(
      eq(pool.status, "filling"),
      myPoolIds.length ? notInArray(pool.id, myPoolIds) : sql`1=1`,
      locationWhere,
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

  const referralCountRow = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLog)
    .where(and(eq(auditLog.actorId, authedUser.id), eq(auditLog.action, "referral.earned")));

  const referralsEarned = referralCountRow[0]?.count ?? 0;
  const referralCreditsPct = Math.min(10, referralsEarned * 2);

  return {
    stats: { ...stats, referralsEarned, referralCreditsPct },
    myPools,
    availablePools: available,
    activity,
    scope,
    locationLabel,
  };
}

export async function getSupplierDashboardData(scopeInput?: string | null) {
  const authedUser = await getAuthedUser();
  if (!authedUser) {
    return { stats: null, suggestedPools: [], myBids: [], scope: "all" as const };
  }
  if (authedUser.role !== "supplier" && authedUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const scope = ((): "all" | "country" | "state" | "city" => {
    const normalized = String(scopeInput || "").trim().toLowerCase();
    if (normalized === "all") return "all";
    if (normalized === "state") return "state";
    if (normalized === "city") return "city";
    return "country";
  })();

  const company = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, authedUser.id),
    columns: { city: true, country: true, state: true },
  });

  const locationCountry = company?.country || null;
  const locationState = company?.state || null;
  const locationCity = company?.city || null;

  const locationWhere = (() => {
    if (scope === "all") return sql`1=1`;
    if (!locationCountry) return sql`1=1`;
    if (scope === "country") return eq(pool.locationCountry, locationCountry);
    if (scope === "state") {
      return and(
        eq(pool.locationCountry, locationCountry),
        locationState ? eq(pool.locationState, locationState) : sql`1=1`,
      );
    }
    return and(
      eq(pool.locationCountry, locationCountry),
      locationState ? eq(pool.locationState, locationState) : sql`1=1`,
      locationCity ? eq(pool.locationCity, locationCity) : sql`1=1`,
    );
  })();

  const suggestedRaw = await db.query.pool.findMany({
    where: and(
      inArray(pool.status, ["filling", "locked"]),
      locationWhere,
    ),
    with: {
      priceTiers: true,
      participants: true,
      supplierBids: {
        where: eq(poolSupplierBid.supplierId, authedUser.id),
        limit: 1,
      },
    },
    orderBy: (fields) => [desc(fields.createdAt)],
    limit: 12,
  });

  const suggestedPools = suggestedRaw.map((poolRecord) => {
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

    const myBid = poolRecord.supplierBids[0] ?? null;

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
      myBid: myBid
        ? {
          id: myBid.id,
          offeredPriceCents: myBid.offeredPriceCents,
          currency: myBid.currency,
          status: myBid.status,
        }
        : null,
    };
  });

  const myBidsRaw = await db.query.poolSupplierBid.findMany({
    where: eq(poolSupplierBid.supplierId, authedUser.id),
    with: {
      pool: {
        with: {
          priceTiers: true,
          participants: true,
        },
      },
    },
    orderBy: (fields) => [desc(fields.createdAt)],
    limit: 20,
  });

  const myBids = myBidsRaw.map((bid) => {
    const poolRecord = bid.pool;
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
      id: bid.id,
      poolId: bid.poolId,
      status: bid.status,
      offeredPriceCents: bid.offeredPriceCents,
      currency: bid.currency,
      maxQuantity: bid.maxQuantity,
      notes: bid.notes,
      createdAt: bid.createdAt,
      pool: {
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
      },
    };
  });

  const stats = {
    activeBids: myBidsRaw.filter((b) => b.status === "open").length,
    suggestedPools: suggestedPools.length,
    locationLabel: [locationCity, locationCountry].filter(Boolean).join(", ") || null,
  };

  return { stats, suggestedPools, myBids, scope };
}

export async function getPoolDetails(poolId: string, viewerId?: string | null) {
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

  const participantUserIds = poolRecord.participants.map((p) => p.userId);
  const supplierUserIds = poolRecord.supplierBids.map((b) => b.supplierId);
  const relatedUserIds = Array.from(new Set([...participantUserIds, ...supplierUserIds]));

  const relatedCompanies = relatedUserIds.length
    ? await db.query.companyProfile.findMany({
      where: inArray(companyProfile.userId, relatedUserIds),
      columns: {
        userId: true,
        companyName: true,
        city: true,
        state: true,
        country: true,
        lat: true,
        lng: true,
      },
    })
    : [];

  const companyByUserId = new Map(relatedCompanies.map((c) => [c.userId, c] as const));

  const participants = poolRecord.participants.map((p) => ({
    ...p,
    company: companyByUserId.get(p.userId) ?? null,
  }));

  const supplierBids = poolRecord.supplierBids.map((b) => ({
    ...b,
    supplierCompany: companyByUserId.get(b.supplierId) ?? null,
  }));

  const progress = computeProgressPercent(poolRecord.currentQuantity, poolRecord.targetQuantity);
  const currentPriceCents = getCurrentPriceCents(
    poolRecord.retailPriceCents,
    poolRecord.priceTiers.map((tier) => ({
      minPercent: tier.minPercent,
      pricePerUnitCents: tier.pricePerUnitCents,
    })),
    progress,
  );

  const vibeRows = await db.query.poolVibeCheck.findMany({
    where: eq(poolVibeCheck.poolId, poolId),
    columns: { matchedSpecs: true, chatHelpful: true, wouldPoolAgain: true },
    limit: 250,
  });

  const vibeSummary = (() => {
    const total = vibeRows.length;
    if (!total) return { total: 0, matchedSpecsPct: 0, chatHelpfulPct: 0, wouldPoolAgainPct: 0 };

    const matched = vibeRows.filter((r) => r.matchedSpecs).length;
    const helpful = vibeRows.filter((r) => r.chatHelpful).length;
    const again = vibeRows.filter((r) => r.wouldPoolAgain).length;

    return {
      total,
      matchedSpecsPct: Math.round((matched / total) * 100),
      chatHelpfulPct: Math.round((helpful / total) * 100),
      wouldPoolAgainPct: Math.round((again / total) * 100),
    };
  })();

  const myVibeCheck = viewerId
    ? await db.query.poolVibeCheck.findFirst({
      where: and(eq(poolVibeCheck.poolId, poolId), eq(poolVibeCheck.userId, viewerId)),
      columns: { id: true },
    })
    : null;

  return {
    ...poolRecord,
    participants,
    supplierBids,
    progress,
    currentPriceCents,
    vibeSummary,
    myVibeCheckSubmitted: Boolean(myVibeCheck?.id),
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

  const isParticipant = await db.query.poolParticipant.findFirst({
    where: and(eq(poolParticipant.poolId, poolId), eq(poolParticipant.userId, authedUser.id)),
    columns: { id: true },
  });

  const isSupplierInPool = await db.query.poolSupplierBid.findFirst({
    where: and(eq(poolSupplierBid.poolId, poolId), eq(poolSupplierBid.supplierId, authedUser.id)),
    columns: { id: true },
  });

  if (!isParticipant && !isSupplierInPool && authedUser.role !== "admin") {
    throw new Error("You must join this pool (or submit an offer) to chat.");
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

export async function submitPoolVibeCheck(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) throw new Error("Not authenticated");

  const poolId = String(formData.get("poolId") || "").trim();
  const matchedSpecs = String(formData.get("matchedSpecs") || "") === "true";
  const chatHelpful = String(formData.get("chatHelpful") || "") === "true";
  const wouldPoolAgain = String(formData.get("wouldPoolAgain") || "") === "true";
  const comment = String(formData.get("comment") || "").trim();

  if (!poolId) throw new Error("Invalid request");

  const poolRecord = await db.query.pool.findFirst({
    where: eq(pool.id, poolId),
    columns: { id: true, status: true },
  });
  if (!poolRecord) throw new Error("Pool not found");
  if (poolRecord.status !== "locked") {
    throw new Error("Vibe check opens once the pool locks.");
  }

  const participant = await db.query.poolParticipant.findFirst({
    where: and(eq(poolParticipant.poolId, poolId), eq(poolParticipant.userId, authedUser.id)),
    columns: { id: true },
  });
  if (!participant) throw new Error("Only pool participants can submit a vibe check.");

  let vibeId: string | null = null;
  let didUpdate = false;

  await db.transaction(async (tx) => {
    const existing = await tx.query.poolVibeCheck.findFirst({
      where: and(eq(poolVibeCheck.poolId, poolId), eq(poolVibeCheck.userId, authedUser.id)),
      columns: { id: true },
    });

    if (existing?.id) {
      vibeId = existing.id;
      didUpdate = true;
      await tx
        .update(poolVibeCheck)
        .set({ matchedSpecs, chatHelpful, wouldPoolAgain, comment: comment || null })
        .where(eq(poolVibeCheck.id, existing.id));
    } else {
      vibeId = randomUUID();
      await tx.insert(poolVibeCheck).values({
        id: vibeId,
        poolId,
        userId: authedUser.id,
        matchedSpecs,
        chatHelpful,
        wouldPoolAgain,
        comment: comment || null,
      });
    }
  });

  await logAudit({
    actorId: authedUser.id,
    action: didUpdate ? "pool.vibe.updated" : "pool.vibe.submitted",
    entityType: "pool",
    entityId: poolId,
    metadata: { matchedSpecs, chatHelpful, wouldPoolAgain },
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

  let bidId: string | null = null;
  let didUpdate = false;

  await db.transaction(async (tx) => {
    const existing = await tx.query.poolSupplierBid.findFirst({
      where: and(
        eq(poolSupplierBid.poolId, poolId),
        eq(poolSupplierBid.supplierId, authedUser.id),
        eq(poolSupplierBid.status, "open"),
      ),
      columns: { id: true },
    });

    if (existing?.id) {
      bidId = existing.id;
      didUpdate = true;
      await tx
        .update(poolSupplierBid)
        .set({
          offeredPriceCents: toCents(offeredPrice),
          currency,
          maxQuantity: maxQuantity > 0 ? maxQuantity : null,
          notes: notes || null,
        })
        .where(eq(poolSupplierBid.id, existing.id));
    } else {
      bidId = randomUUID();
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
    }

    await tx.insert(poolActivity).values({
      id: randomUUID(),
      poolId,
      type: "supplier_bid",
      message: `Supplier ${authedUser.name || authedUser.email} ${didUpdate ? "updated" : "submitted"} an offer.`,
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
    action: didUpdate ? "pool.bid.updated" : "pool.bid.submitted",
    entityType: "pool_bid",
    entityId: bidId || "unknown",
    metadata: { poolId },
  });

  revalidatePath(`/pools/${poolId}`);
}

export async function acceptSupplierBid(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) throw new Error("Not authenticated");

  const poolId = String(formData.get("poolId") || "").trim();
  const bidId = String(formData.get("bidId") || "").trim();
  if (!poolId || !bidId) throw new Error("Invalid request");

  const poolRecord = await db.query.pool.findFirst({
    where: eq(pool.id, poolId),
    columns: { id: true, creatorId: true, status: true, minFillPercent: true, currentQuantity: true, targetQuantity: true, unit: true },
  });
  if (!poolRecord) throw new Error("Pool not found");

  const isOwner = poolRecord.creatorId === authedUser.id;
  if (!isOwner && authedUser.role !== "admin") {
    throw new Error("Only the pool owner can accept an offer");
  }

  const progress = poolRecord.targetQuantity
    ? (poolRecord.currentQuantity / poolRecord.targetQuantity) * 100
    : 0;

  if (progress < poolRecord.minFillPercent) {
    throw new Error(`Pool must reach ${poolRecord.minFillPercent}% before selecting a supplier.`);
  }

  let supplierId: string | null = null;
  let acceptedStatus: "accepted" | "accepted_partial" = "accepted";
  let oversubscriptionRemainder: number | null = null;

  await db.transaction(async (tx) => {
    const bid = await tx.query.poolSupplierBid.findFirst({
      where: and(eq(poolSupplierBid.id, bidId), eq(poolSupplierBid.poolId, poolId)),
      columns: { id: true, supplierId: true, maxQuantity: true },
    });
    if (!bid) throw new Error("Offer not found");
    supplierId = bid.supplierId;

    if (bid.maxQuantity != null && poolRecord.currentQuantity > bid.maxQuantity) {
      acceptedStatus = "accepted_partial";
      oversubscriptionRemainder = poolRecord.currentQuantity - bid.maxQuantity;
    }

    await tx.update(poolSupplierBid).set({ status: acceptedStatus }).where(eq(poolSupplierBid.id, bidId));

    if (acceptedStatus === "accepted") {
      await tx
        .update(poolSupplierBid)
        .set({ status: "rejected" })
        .where(and(eq(poolSupplierBid.poolId, poolId), sql`${poolSupplierBid.id} <> ${bidId}`, inArray(poolSupplierBid.status, ["open", "accepted", "accepted_partial"])));
    }

    await tx.insert(poolActivity).values({
      id: randomUUID(),
      poolId,
      type: "supplier_selected",
      message: acceptedStatus === "accepted_partial"
        ? `A supplier offer was accepted, but it can't fulfill the full amount. We're sourcing the remaining quantity now.`
        : `A supplier offer was accepted for this pool.`,
    });

    if (acceptedStatus === "accepted_partial" && oversubscriptionRemainder) {
      await tx.insert(poolActivity).values({
        id: randomUUID(),
        poolId,
        type: "oversubscription",
        message: `Oversubscribed: remaining ${oversubscriptionRemainder}${poolRecord.unit} needs coverage by another supplier.`,
      });
    }

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
          title: acceptedStatus === "accepted_partial" ? "Supplier partially selected" : "Supplier selected",
          body: acceptedStatus === "accepted_partial"
            ? `A supplier was selected, but we still need ${oversubscriptionRemainder}${poolRecord.unit} more.`
            : "A supplier offer was accepted for this pool.",
          href: `/pools/${poolId}`,
        })),
      );
    }

    if (bid.supplierId) {
      await tx.insert(notification).values({
        id: randomUUID(),
        userId: bid.supplierId,
        type: "pool",
        title: "Offer accepted",
        body: acceptedStatus === "accepted_partial"
          ? "Your offer was accepted, but only for part of the pool quantity."
          : "Your supplier offer was accepted.",
        href: `/pools/${poolId}`,
      });
    }

    if (acceptedStatus === "accepted_partial" && oversubscriptionRemainder) {
      const otherSuppliers = await tx.query.poolSupplierBid.findMany({
        where: and(
          eq(poolSupplierBid.poolId, poolId),
          sql`${poolSupplierBid.id} <> ${bidId}`,
          eq(poolSupplierBid.status, "open"),
        ),
        columns: { supplierId: true },
        limit: 50,
      });

      const uniqueSupplierIds = Array.from(new Set(otherSuppliers.map((s) => s.supplierId).filter(Boolean)));
      if (uniqueSupplierIds.length) {
        await tx.insert(notification).values(
          uniqueSupplierIds.map((sid) => ({
            id: randomUUID(),
            userId: sid,
            type: "pool",
            title: "Pool needs extra supply",
            body: `This pool still needs ${oversubscriptionRemainder}${poolRecord.unit}. Can you cover the remainder?`,
            href: `/pools/${poolId}`,
          })),
        );
      }
    }
  });

  await logAudit({
    actorId: authedUser.id,
    action: "pool.bid.accepted",
    entityType: "pool_bid",
    entityId: bidId,
    metadata: { poolId, supplierId },
  });

  revalidatePath(`/pools/${poolId}`);
}

export async function getPoolLiveState(poolId: string, viewerId: string | null) {
  return getPoolDetails(poolId, viewerId);
}

export async function createPoolAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await createPool(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

export async function joinPoolAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await joinPool(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

export async function sendPoolMessageAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await sendPoolMessage(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

export async function submitSupplierBidAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await submitSupplierBid(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

export async function acceptSupplierBidAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await acceptSupplierBid(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}

export async function submitPoolVibeCheckAction(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  try {
    await submitPoolVibeCheck(formData);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
