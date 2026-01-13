import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyThreads } from "@/lib/messages";

export default async function InboxPage() {
  const threads = await getMyThreads();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">Messages between buyers, suppliers, and admins.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>Your recent threads.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {threads.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
          )}

          {threads.map((t) => {
            const lastAt = t.lastMessage?.createdAt ? new Date(t.lastMessage.createdAt).getTime() : 0;
            const readAt = t.lastReadAt ? new Date(t.lastReadAt).getTime() : 0;
            const unread = lastAt > readAt;

            return (
              <Link
                key={t.threadId}
                href={`/inbox/${t.threadId}`}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {t.otherUser?.name || t.otherUser?.email || "Conversation"}
                    </p>
                    {unread && <Badge variant="default">New</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.lastMessage?.body || "No messages yet"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">Open</span>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
