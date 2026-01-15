'use server'

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  directMessage,
  messageThread,
  messageThreadParticipant,
  notification,
  user,
} from "@/lib/db/schema";
import { logAudit } from "@/lib/audit";

async function getAuthedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

async function findOrCreateDirectThread(params: { userA: string; userB: string }) {
  const [a, b] = [params.userA, params.userB].sort();

  // Find candidate threads where both users are participants.
  // For MVP we treat all threads as direct (2 participants), so we can keep the query simple and robust.
  const candidates = await db
    .select({ threadId: messageThreadParticipant.threadId })
    .from(messageThreadParticipant)
    .where(inArray(messageThreadParticipant.userId, [a, b]))
    .groupBy(messageThreadParticipant.threadId)
    .having(sql`COUNT(DISTINCT ${messageThreadParticipant.userId}) = 2`)
    .limit(20);

  if (candidates.length) {
    // Prefer the most recently created candidate by thread createdAt.
    const candidateIds = candidates.map((c) => c.threadId);
    const existing = await db
      .select({ id: messageThread.id })
      .from(messageThread)
      .where(inArray(messageThread.id, candidateIds))
      .orderBy(desc(messageThread.createdAt))
      .limit(1);

    const existingThreadId = existing[0]?.id;
    if (existingThreadId) return existingThreadId;
  }

  const threadId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(messageThread).values({ id: threadId, lastMessageAt: null });
    await tx.insert(messageThreadParticipant).values([
      { id: randomUUID(), threadId, userId: a, lastReadAt: new Date() },
      { id: randomUUID(), threadId, userId: b, lastReadAt: null },
    ]);
  });

  return threadId;
}

export async function startDirectThread(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) throw new Error("Not authenticated");

  const otherUserId = String(formData.get("otherUserId") || "").trim();
  if (!otherUserId || otherUserId === authedUser.id) throw new Error("Invalid recipient");

  const threadId = await findOrCreateDirectThread({ userA: authedUser.id, userB: otherUserId });

  await logAudit({
    actorId: authedUser.id,
    action: "message.thread.opened",
    entityType: "direct_message",
    entityId: threadId,
    metadata: { otherUserId },
  });

  redirect(`/inbox/${threadId}`);
}

export async function sendDirectMessage(formData: FormData): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) throw new Error("Not authenticated");

  const threadId = String(formData.get("threadId") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!threadId || !body) throw new Error("Message cannot be empty");

  const participant = await db.query.messageThreadParticipant.findFirst({
    where: and(eq(messageThreadParticipant.threadId, threadId), eq(messageThreadParticipant.userId, authedUser.id)),
  });
  if (!participant) throw new Error("Unauthorized");

  const now = new Date();
  const msgId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(directMessage).values({
      id: msgId,
      threadId,
      senderId: authedUser.id,
      body,
    });

    await tx
      .update(messageThread)
      .set({ lastMessageAt: now })
      .where(eq(messageThread.id, threadId));

    await tx
      .update(messageThreadParticipant)
      .set({ lastReadAt: now })
      .where(eq(messageThreadParticipant.id, participant.id));

    const others = await tx.query.messageThreadParticipant.findMany({
      where: and(eq(messageThreadParticipant.threadId, threadId), sql`${messageThreadParticipant.userId} <> ${authedUser.id}`),
    });

    if (others.length) {
      await tx.insert(notification).values(
        others.map((row) => ({
          id: randomUUID(),
          userId: row.userId,
          type: "message",
          title: "New message",
          body: body.slice(0, 140),
          href: `/inbox/${threadId}`,
        })),
      );
    }
  });

  await logAudit({
    actorId: authedUser.id,
    action: "message.sent",
    entityType: "direct_message",
    entityId: msgId,
    metadata: { threadId },
  });
}

export async function markThreadRead(threadId: string): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) return;

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(messageThreadParticipant)
      .set({ lastReadAt: now })
      .where(and(eq(messageThreadParticipant.threadId, threadId), eq(messageThreadParticipant.userId, authedUser.id)));

    await tx
      .update(notification)
      .set({ readAt: now })
      .where(and(eq(notification.userId, authedUser.id), eq(notification.href, `/inbox/${threadId}`), sql`${notification.readAt} IS NULL`));
  });
}

export async function getMyThreads() {
  const authedUser = await getAuthedUser();
  if (!authedUser) return [];

  const rows = await db.query.messageThreadParticipant.findMany({
    where: eq(messageThreadParticipant.userId, authedUser.id),
    with: {
      thread: {
        with: {
          participants: { with: { user: true } },
          messages: {
            with: { sender: true },
            orderBy: (fields) => [desc(fields.createdAt)],
            limit: 1,
          },
        },
      },
    },
    orderBy: (fields) => [desc(fields.createdAt)],
  });

  return rows
    .map((row) => {
      const thread = row.thread;
      const last = thread.messages[0] ?? null;
      const other = thread.participants
        .map((p) => p.user)
        .find((u) => u.id !== authedUser.id);

      return {
        threadId: thread.id,
        otherUser: other ? { id: other.id, name: other.name, email: other.email, image: other.image } : null,
        lastMessage: last
          ? {
            id: last.id,
            body: last.body,
            createdAt: last.createdAt,
            senderId: last.senderId,
            senderName: last.sender?.name ?? null,
          }
          : null,
        lastReadAt: row.lastReadAt,
        lastMessageAt: thread.lastMessageAt,
      };
    })
    .sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });
}

export async function getThreadDetails(threadId: string) {
  const authedUser = await getAuthedUser();
  if (!authedUser) return null;

  const participant = await db.query.messageThreadParticipant.findFirst({
    where: and(eq(messageThreadParticipant.threadId, threadId), eq(messageThreadParticipant.userId, authedUser.id)),
  });
  if (!participant) return null;

  const thread = await db.query.messageThread.findFirst({
    where: eq(messageThread.id, threadId),
    with: {
      participants: { with: { user: true } },
      messages: { with: { sender: true }, orderBy: (fields) => [desc(fields.createdAt)], limit: 100 },
    },
  });

  if (!thread) return null;

  const other = thread.participants
    .map((p) => p.user)
    .find((u) => u.id !== authedUser.id);

  return {
    threadId: thread.id,
    otherUser: other ? { id: other.id, name: other.name, email: other.email, image: other.image } : null,
    myUserId: authedUser.id,
    messages: [...thread.messages]
      .reverse()
      .map((m) => ({
        id: m.id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId,
        senderName: m.sender?.name ?? null,
      })),
  };
}

export async function getMyUnreadCount() {
  const authedUser = await getAuthedUser();
  if (!authedUser) return 0;

  const rows = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(notification)
    .where(and(eq(notification.userId, authedUser.id), sql`${notification.readAt} IS NULL`));

  return Number(rows[0]?.c ?? 0);
}

export async function listMyNotifications(limit = 20) {
  const authedUser = await getAuthedUser();
  if (!authedUser) return [];

  return db.query.notification.findMany({
    where: eq(notification.userId, authedUser.id),
    orderBy: (fields) => [desc(fields.createdAt)],
    limit,
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  const authedUser = await getAuthedUser();
  if (!authedUser) return;

  const now = new Date();
  await db
    .update(notification)
    .set({ readAt: now })
    .where(and(eq(notification.userId, authedUser.id), sql`${notification.readAt} IS NULL`));
}
