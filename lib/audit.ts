'use server'

import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export type AuditEntityType =
  | "company_profile"
  | "pool"
  | "pool_bid"
  | "pool_message"
  | "direct_message"
  | "user"
  | "system";

export async function logAudit(params: {
  actorId: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId?: string | null;
  metadata?: unknown;
}) {
  const metadata = params.metadata === undefined ? null : JSON.stringify(params.metadata);

  await db.insert(auditLog).values({
    id: randomUUID(),
    actorId: params.actorId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    metadata,
  });
}
