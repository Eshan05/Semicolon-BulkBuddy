import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyLocationMap } from "@/components/features/profile/company-location-map";
import { getCompanyByUserId } from "@/lib/profiles";

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const data = await getCompanyByUserId(userId);
  if (!data) notFound();

  const { company, insights } = data;

  const profile = company.companyType === "buyer" ? company.buyerProfile : company.supplierProfile;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{company.companyName}</h1>
        <p className="text-muted-foreground">{company.legalName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">{company.companyType}</Badge>
          <Badge variant={company.status === "approved" ? "default" : "outline"} className="capitalize">{company.status}</Badge>
          <Badge variant="outline">Trust score: {insights.trustScore}/100</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trust & activity</CardTitle>
          <CardDescription>Lightweight signals from platform activity (MVP).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <Info label="Completed pools" value={`${insights.completedPools}`} />
          <Info label="Soft commits" value={`${insights.softCommits}`} />
          <Info label="Pool closers" value={`${insights.poolClosers}`} />
          <Info label="Accepted offers" value={`${insights.supplierAcceptedOffers}`} />
          <Info label="Join streak" value={`${insights.poolJoinStreak}`} />
          <Info label="Referrals" value={`${insights.referralsEarned}`} />
          <div className="md:col-span-6 rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Badges</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {insights.badges.length ? (
                insights.badges.map((b) => (
                  <Badge key={b} variant="secondary">{b}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No badges yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company details</CardTitle>
          <CardDescription>Public onboarding info (within the platform).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Info label="Location" value={[company.city, company.state, company.country].filter(Boolean).join(", ")} />
          <Info label="Website" value={company.website || "—"} />
          <Info label="Contact" value={`${company.contactName} • ${company.contactEmail}`} />

          <div className="md:col-span-3">
            <CompanyLocationMap
              lat={company.lat ?? null}
              lng={company.lng ?? null}
              label={company.companyName}
              locationLabel={[company.city, company.state, company.country].filter(Boolean).join(", ")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{company.companyType === "buyer" ? "Buyer profile" : "Supplier profile"}</CardTitle>
          <CardDescription>Operational details shared during onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {profile ? (
            Object.entries(profile)
              .filter(([k]) => !["id", "companyId", "createdAt", "updatedAt"].includes(k))
              .map(([key, value]) => (
                <Info key={key} label={toTitle(key)} value={String(value ?? "—")} />
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No profile details provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium wrap-break-word">{value}</p>
    </div>
  );
}

function toTitle(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}
