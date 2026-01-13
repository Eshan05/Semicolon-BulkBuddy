import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const items = await db.query.notification.findMany({
    where: eq(notification.userId, session.user.id),
    orderBy: (fields) => [desc(fields.createdAt)],
    limit: 20,
  });

  const unreadRows = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(notification)
    .where(and(eq(notification.userId, session.user.id), sql`${notification.readAt} IS NULL`));

  const unreadCount = Number(unreadRows[0]?.c ?? 0);

  return NextResponse.json({ notifications: items, unreadCount });
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  await db
    .update(notification)
    .set({ readAt: now })
    .where(and(eq(notification.userId, session.user.id), sql`${notification.readAt} IS NULL`));

  return NextResponse.json({ ok: true });
}
