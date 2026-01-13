import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAuditLogs } from "@/lib/admin";

export default async function AdminLogsPage() {
  const logs = await listAuditLogs(200).catch(() => []);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">Audit trail for sensitive actions.</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to admin console</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Most recent actions first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 && <p className="text-sm text-muted-foreground">No audit logs yet.</p>}
          {logs.map((log) => (
            <div key={log.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.actor?.email || "system"} • {log.entityType}{log.entityId ? `:${log.entityId}` : ""}
                  </p>
                </div>
                <Badge variant="outline">{log.createdAt.toLocaleString()}</Badge>
              </div>
              {log.metadata && (
                <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-muted p-2 text-xs">{log.metadata}</pre>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
