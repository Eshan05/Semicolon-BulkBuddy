import Link from "next/link";

import { AuditLogView } from "@/components/features/admin/audit-log-view";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <CardDescription>Search, scan, and inspect metadata.</CardDescription>
        </CardHeader>
        <AuditLogView logs={logs} />
      </Card>
    </div>
  );
}
