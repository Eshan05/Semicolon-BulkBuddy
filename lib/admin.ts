'use server'

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { logAudit } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

async function getAuthedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireAdmin() {
  const authedUser = await getAuthedUser();
  if (!authedUser || authedUser.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return authedUser;
}

export async function listAllCompanies() {
  await requireAdmin();

  return db.query.companyProfile.findMany({
    with: {
      user: true,
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
    },
    orderBy: (fields) => [desc(fields.submittedAt)],
  });
}

export async function getSupportContact() {
  const authedUser = await getAuthedUser();
  if (!authedUser) return null;

  const adminUser = await db.query.user.findFirst({
    where: eq(user.role, "admin"),
    columns: { id: true, name: true, email: true },
  });

  return adminUser ?? null;
}

export async function setUserBan(formData: FormData): Promise<void> {
  const authedUser = await requireAdmin();

  const userId = String(formData.get("userId") || "").trim();
  const banned = String(formData.get("banned") || "").trim() === "true";
  const banReason = String(formData.get("banReason") || "").trim();

  if (!userId) throw new Error("Invalid user");

  await db
    .update(user)
    .set({
      banned,
      banReason: banned ? (banReason || "Banned by admin") : null,
      banExpires: null,
    })
    .where(eq(user.id, userId));

  await logAudit({
    actorId: authedUser.id,
    action: banned ? "user.banned" : "user.unbanned",
    entityType: "user",
    entityId: userId,
    metadata: banned ? { reason: banReason || null } : null,
  });
}

export async function listAuditLogs(limit = 100) {
  await requireAdmin();

  return db.query.auditLog.findMany({
    with: { actor: true },
    orderBy: (fields) => [desc(fields.createdAt)],
    limit,
  });
}
