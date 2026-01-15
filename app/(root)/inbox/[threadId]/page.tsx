import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getThreadDetails, markThreadRead, sendDirectMessage } from "@/lib/messages";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const data = await getThreadDetails(threadId);
  if (!data) notFound();

  await markThreadRead(threadId);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href="/inbox" className="text-xs text-muted-foreground hover:underline">Back to inbox</Link>
          <h1 className="truncate text-2xl font-semibold">
            {data.otherUser?.name || data.otherUser?.email || "Conversation"}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border p-4 max-h-[60vh] overflow-y-auto">
            {data.messages.length === 0 && (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            )}
            {data.messages.map((m) => {
              const mine = m.senderId === data.myUserId;
              return (
                <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div className={mine ? "max-w-[80%] rounded-xl bg-primary px-3 py-2 text-primary-foreground" : "max-w-[80%] rounded-xl bg-muted px-3 py-2"}>
                    <p className="text-xs opacity-80">{mine ? "You" : (m.senderName || "User")}</p>
                    <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form action={sendDirectMessage} className="flex gap-2">
            <input type="hidden" name="threadId" value={data.threadId} />
            <Input name="body" placeholder="Write a message" required />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
