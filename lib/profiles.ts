'use server'

import { headers } from "next/headers";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditLog, companyProfile, pool, poolParticipant, poolVibeCheck } from "@/lib/db/schema";

async function getAuthedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function getCompanyByUserId(userId: string) {
  const authedUser = await getAuthedUser();
  if (!authedUser) return null;

  const company = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, userId),
    with: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
      user: true,
    },
  });

  if (!company) return null;

  const [vibeCountRow, participationRows, recentJoins, recentAccepted, referralEarnedRows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(poolVibeCheck)
      .where(eq(poolVibeCheck.userId, userId)),
    db.query.poolParticipant.findMany({
      where: eq(poolParticipant.userId, userId),
      with: { pool: { columns: { status: true } } },
      limit: 500,
    }),
    db.query.auditLog.findMany({
      where: and(eq(auditLog.actorId, userId), eq(auditLog.action, "pool.joined")),
      orderBy: (fields) => [desc(fields.createdAt)],
      limit: 500,
      columns: { metadata: true },
    }),
    db.query.auditLog.findMany({
      where: eq(auditLog.action, "pool.bid.accepted"),
      orderBy: (fields) => [desc(fields.createdAt)],
      limit: 800,
      columns: { metadata: true },
    }),
    db.query.auditLog.findMany({
      where: and(eq(auditLog.actorId, userId), eq(auditLog.action, "referral.earned")),
      orderBy: (fields) => [desc(fields.createdAt)],
      limit: 500,
      columns: { id: true },
    }),
  ]);

  const vibeChecksSubmitted = vibeCountRow[0]?.count ?? 0;
  const completedPools = participationRows.filter((p) => p.pool?.status === "locked").length;

  const joinStats = recentJoins.reduce(
    (acc, row) => {
      if (!row.metadata) return acc;
      try {
        const meta = JSON.parse(row.metadata) as any;
        if (meta?.commit) acc.softCommits += 1;
        if (meta?.joinedNearClose) acc.joinsNearClose += 1;
        if (meta?.pushedOverTarget) acc.poolClosers += 1;
      } catch {
        // ignore bad metadata
      }
      return acc;
    },
    { softCommits: 0, joinsNearClose: 0, poolClosers: 0 },
  );

  const poolJoinStreak = (() => {
    // Simple streak definition (MVP): consecutive joins (most-recent-first) where user also soft-committed.
    let streak = 0;
    for (const row of recentJoins) {
      if (!row.metadata) break;
      try {
        const meta = JSON.parse(row.metadata) as any;
        if (meta?.commit) streak += 1;
        else break;
      } catch {
        break;
      }
    }
    return streak;
  })();

  const referralsEarned = referralEarnedRows.length;

  const supplierAcceptedOffers = recentAccepted.reduce((acc, row) => {
    if (!row.metadata) return acc;
    try {
      const meta = JSON.parse(row.metadata) as any;
      if (meta?.supplierId === userId) return acc + 1;
    } catch {
      // ignore
    }
    return acc;
  }, 0);

  const trustScore = Math.max(
    0,
    Math.min(
      100,
      completedPools * 12 +
      vibeChecksSubmitted * 2 +
      joinStats.softCommits * 4 +
      joinStats.poolClosers * 10 +
      supplierAcceptedOffers * 15 +
      Math.min(10, referralsEarned * 2),
    ),
  );

  const badges = [
    joinStats.poolClosers >= 1 ? "Pool closer" : null,
    poolJoinStreak >= 3 || joinStats.softCommits >= 3 ? "Reliable pooler" : null,
    joinStats.joinsNearClose >= 1 ? "Pool closer assist" : null,
    referralsEarned >= 1 ? "Referrer" : null,
    supplierAcceptedOffers >= 1 ? "Selected supplier" : null,
  ].filter(Boolean) as string[];

  return {
    company,
    insights: {
      trustScore,
      completedPools,
      vibeChecksSubmitted,
      softCommits: joinStats.softCommits,
      poolClosers: joinStats.poolClosers,
      poolJoinStreak,
      referralsEarned,
      supplierAcceptedOffers,
      badges,
    },
  };
}
