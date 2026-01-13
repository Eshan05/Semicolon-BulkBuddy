import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CreditCard, Users, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { listPendingVerifications, updateVerificationStatus } from "@/lib/onboarding";

export default async function AdminDashboard() {
  const pending = await listPendingVerifications().catch(() => []);
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Platform-wide overview and management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">System Logs</Button>
          <Button>User Management</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$142,380</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              180 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Queue</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
            <p className="text-xs text-muted-foreground">
              Companies awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Alerts & Flags</CardTitle>
            <CardDescription>
              Potential issues requiring administrative attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { msg: "Suspicious login attempt detected (ID: 8821)", severity: "high", time: "10m ago" },
                { msg: "Pool #4492 failed to close automatically", severity: "medium", time: "1h ago" },
                { msg: "Supplier 'MetalCo' license expiring soon", severity: "low", time: "5h ago" },
                { msg: "User reported payment issue #Ticket-992", severity: "medium", time: "1d ago" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className={`h-5 w-5 ${alert.severity === "high" ? "text-destructive" :
                        alert.severity === "medium" ? "text-orange-500" : "text-blue-500"
                      }`} />
                    <div>
                      <p className="text-sm font-medium">{alert.msg}</p>
                      <p className="text-xs text-muted-foreground uppercase">{alert.severity} priority</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>New Signups</CardTitle>
            <CardDescription>
              Latest registered companies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending verifications.</p>
              )}
              {pending.map((company) => (
                <div key={company.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{company.companyName}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="px-1 py-0 text-tiny capitalize">
                        {company.companyType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(company.submittedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await updateVerificationStatus({ companyId: company.id, status: "approved" });
                      }}
                    >
                      <Button size="sm" variant="outline">Approve</Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await updateVerificationStatus({ companyId: company.id, status: "rejected" });
                      }}
                    >
                      <Button size="sm" variant="ghost">Reject</Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
