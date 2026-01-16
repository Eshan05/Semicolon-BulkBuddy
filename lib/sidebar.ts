import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { poolParticipant } from "@/lib/db/schema";
import { getMyThreads } from "@/lib/messages";
import { desc, eq } from "drizzle-orm";

export type SidebarRecentPool = {
  id: string;
  title: string;
  status: string;
  href: string;
};

export type SidebarRecentThread = {
  threadId: string;
  title: string;
  subtitle: string | null;
  href: string;
};

export async function getSidebarData() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  const [activeSessions, deviceSessions] = await Promise.all([
    auth.api.listSessions({
      headers: requestHeaders,
    }),
    auth.api.listDeviceSessions({
      headers: requestHeaders,
    }),
  ]);
  const user = session?.user ?? null;

  if (!user) {
    return {
      session: null,
      deviceSessions: [],
      role: null,
      recentPools: [] as SidebarRecentPool[],
      recentThreads: [] as SidebarRecentThread[],
    };
  }

  const recentPoolRows = await db.query.poolParticipant.findMany({
    where: eq(poolParticipant.userId, user.id),
    with: {
      pool: {
        columns: { id: true, title: true, status: true },
      },
    },
    orderBy: (fields) => [desc(fields.createdAt)],
    limit: 5,
  });

  const recentPools: SidebarRecentPool[] = recentPoolRows
    .map((row) => row.pool)
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      href: `/pools/${p.id}`,
    }));

  const threads = await getMyThreads();
  const recentThreads: SidebarRecentThread[] = threads.slice(0, 5).map((t) => {
    const title = t.otherUser?.name || t.otherUser?.email || "Conversation";
    const subtitle = t.lastMessage ? t.lastMessage.body.slice(0, 42) : null;
    return {
      threadId: t.threadId,
      title,
      subtitle,
      href: `/inbox/${t.threadId}`,
    };
  });

  return {
    session,
    deviceSessions,
    role: user.role ?? null,
    recentPools,
    recentThreads,
  };
}
