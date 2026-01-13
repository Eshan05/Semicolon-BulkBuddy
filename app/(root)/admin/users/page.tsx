import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAllCompanies, setUserBan } from "@/lib/admin";
import { startDirectThread } from "@/lib/messages";

export default async function AdminUsersPage() {
  const companies = await listAllCompanies().catch(() => []);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Browse buyers/suppliers and take actions.</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to admin console</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>All onboarding submissions (approved/pending/rejected).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {companies.length === 0 && (
            <p className="text-sm text-muted-foreground">No companies found.</p>
          )}

          {companies.map((c) => (
            <div key={c.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.companyName}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.user?.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{c.companyType}</Badge>
                    <Badge variant={c.status === "approved" ? "default" : c.status === "pending" ? "secondary" : "outline"} className="capitalize">
                      {c.status}
                    </Badge>
                    {c.user?.banned && <Badge variant="destructive">Banned</Badge>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {c.user?.id && (
                    <form action={startDirectThread}>
                      <input type="hidden" name="otherUserId" value={c.user.id} />
                      <Button type="submit" size="sm" variant="outline">Message</Button>
                    </form>
                  )}

                  {c.user?.id && (
                    <form action={setUserBan} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={c.user.id} />
                      <input type="hidden" name="banned" value={String(!c.user.banned)} />
                      {!c.user.banned && (
                        <Input name="banReason" placeholder="Ban reason" className="h-9 w-44" />
                      )}
                      <Button type="submit" size="sm" variant={c.user.banned ? "secondary" : "destructive"}>
                        {c.user.banned ? "Unban" : "Ban"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Info label="City" value={c.city} />
                <Info label="Country" value={c.country} />
                <Info label="Primary contact" value={c.contactName} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  );
}
