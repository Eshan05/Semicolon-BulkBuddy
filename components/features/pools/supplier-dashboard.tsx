"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo } from "react";
import { ArrowUpRight, BadgeDollarSign, Building2, HandCoins, MapPin, Package2, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { submitSupplierBidAction } from "@/lib/pools";
import { cn } from "@/lib/utils";

export type SupplierPool = {
  id: string;
  title: string;
  material: string;
  specification?: string | null;
  unit: string;
  status: string;
  targetQuantity: number;
  currentQuantity: number;
  progress: number;
  currentPriceCents: number;
  retailPriceCents: number;
  currency: string;
  participantsCount: number;
  location?: string;
  myBid: {
    id: string;
    offeredPriceCents: number;
    currency: string;
    status: string;
  } | null;
};

export type SupplierBid = {
  id: string;
  poolId: string;
  status: string;
  offeredPriceCents: number;
  currency: string;
  maxQuantity: number | null;
  notes: string | null;
  createdAt: Date | number | string;
  pool: {
    id: string;
    title: string;
    material: string;
    specification?: string | null;
    unit: string;
    status: string;
    targetQuantity: number;
    currentQuantity: number;
    progress: number;
    currentPriceCents: number;
    retailPriceCents: number;
    currency: string;
    participantsCount: number;
    location?: string;
  };
};

type Props = {
  stats: {
    activeBids: number;
    suggestedPools: number;
    locationLabel: string | null;
  } | null;
  suggestedPools: SupplierPool[];
  myBids: SupplierBid[];
  scope: "all" | "country" | "state" | "city";
};

const formatCurrency = (cents: number, currency: string) => {
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
};

export function SupplierDashboardClient({ stats, suggestedPools, myBids, scope }: Props) {
  const suggestedLabel = useMemo(() => {
    if (stats?.locationLabel) return `Suggested near ${stats.locationLabel}`;
    return "Suggested pools";
  }, [stats?.locationLabel]);

  const [bidResult, bidAction, bidPending] = useActionState(submitSupplierBidAction, null);

  useEffect(() => {
    if (!bidResult) return;
    if (bidResult.ok) toast.success("Offer submitted");
    else toast.error(bidResult.error);
  }, [bidResult]);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Dashboard</h1>
          <p className="text-muted-foreground">Bid on pools, chat in rooms, and convert demand into bulk deals.</p>
        </div>
        <Link href="/inbox" className={cn(buttonVariants({ variant: "outline" }))}>
          Open inbox
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active bids</CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBids ?? 0}</div>
            <p className="text-xs text-muted-foreground">Offers you’ve submitted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggested pools</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.suggestedPools ?? suggestedPools.length}</div>
            <p className="text-xs text-muted-foreground">Open pools accepting offers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location match</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.locationLabel ? "On" : "—"}</div>
            <p className="text-xs text-muted-foreground">{stats?.locationLabel || "Set location in profile"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suggestedPools.filter((p) => p.myBid).length}</div>
            <p className="text-xs text-muted-foreground">Pools where you’ve engaged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{suggestedLabel}</CardTitle>
                <CardDescription>Jump into a room and submit an offer. Buyers see bids instantly.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/supplier/dashboard?scope=country"
                  className={cn(buttonVariants({ size: "sm", variant: scope === "country" ? "default" : "outline" }))}
                >
                  Nearby
                </Link>
                <Link
                  href="/supplier/dashboard?scope=state"
                  className={cn(buttonVariants({ size: "sm", variant: scope === "state" ? "default" : "outline" }))}
                >
                  Same state
                </Link>
                <Link
                  href="/supplier/dashboard?scope=city"
                  className={cn(buttonVariants({ size: "sm", variant: scope === "city" ? "default" : "outline" }))}
                >
                  Same city
                </Link>
                <Link
                  href="/supplier/dashboard?scope=all"
                  className={cn(buttonVariants({ size: "sm", variant: scope === "all" ? "default" : "outline" }))}
                >
                  All
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedPools.length === 0 && (
              <p className="text-sm text-muted-foreground">No pools available right now.</p>
            )}

            {suggestedPools.map((pool) => (
              <div key={pool.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold">{pool.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pool.material}
                      {pool.specification ? ` • ${pool.specification}` : ""}
                      {pool.location ? ` • ${pool.location}` : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={pool.status === "locked" ? "default" : "secondary"} className="capitalize">
                        {pool.status}
                      </Badge>
                      <Badge variant="outline">{pool.participantsCount} buyers</Badge>
                      {pool.myBid && (
                        <Badge variant="secondary">My offer: {formatCurrency(pool.myBid.offeredPriceCents, pool.myBid.currency)}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/pools/${pool.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Open room
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>

                    <Credenza>
                      <CredenzaTrigger className={cn(buttonVariants({ size: "sm" }))}>
                        {pool.myBid ? "Update offer" : "Place offer"}
                      </CredenzaTrigger>
                      <CredenzaContent className="max-w-lg">
                        <CredenzaHeader>
                          <CredenzaTitle>Submit supplier offer</CredenzaTitle>
                        </CredenzaHeader>
                        <CredenzaBody className="grid gap-4">
                          <div className="rounded-lg border p-3">
                            <p className="text-sm font-medium">{pool.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Current buyer price: {formatCurrency(pool.currentPriceCents, pool.currency)} / {pool.unit}
                            </p>
                          </div>

                          <form action={bidAction} className="grid gap-4">
                            <input type="hidden" name="poolId" value={pool.id} />

                            <div className="grid gap-2">
                              <Label htmlFor={`offer-${pool.id}`}>Offered price / unit</Label>
                              <Input
                                id={`offer-${pool.id}`}
                                name="offeredPrice"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="e.g. 3.10"
                                defaultValue={
                                  process.env.NODE_ENV === "development"
                                    ? Number((((pool.currentPriceCents / 100) * 0.9)).toFixed(2))
                                    : undefined
                                }
                                required
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="grid gap-2">
                                <Label htmlFor={`currency-${pool.id}`}>Currency</Label>
                                <Input id={`currency-${pool.id}`} name="currency" defaultValue={pool.currency} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor={`max-${pool.id}`}>Max quantity (optional)</Label>
                                <Input id={`max-${pool.id}`} name="maxQuantity" type="number" min={0} step={1} placeholder="e.g. 2000" />
                              </div>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor={`notes-${pool.id}`}>Notes (optional)</Label>
                              <Input id={`notes-${pool.id}`} name="notes" placeholder="Lead time, packing, MOQ, incoterms…" />
                              {process.env.NODE_ENV === "development" ? (
                                <p className="text-xs text-muted-foreground">Dev default: price prefilled at ~10% below buyer price.</p>
                              ) : null}
                            </div>

                            <Separator />

                            <CredenzaFooter className="justify-end">
                              <Button type="submit" disabled={bidPending}>
                                <BadgeDollarSign className="mr-2 h-4 w-4" />
                                {bidPending ? "Submitting…" : "Submit offer"}
                              </Button>
                            </CredenzaFooter>
                          </form>
                        </CredenzaBody>
                      </CredenzaContent>
                    </Credenza>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>My offers</CardTitle>
            <CardDescription>Your submitted bids across pools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myBids.length === 0 && (
              <p className="text-sm text-muted-foreground">No offers submitted yet.</p>
            )}

            {myBids.map((bid) => (
              <Link
                key={bid.id}
                href={`/pools/${bid.poolId}`}
                className="block rounded-xl border p-3 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{bid.pool.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {bid.pool.material}
                      {bid.pool.location ? ` • ${bid.pool.location}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{bid.status}</Badge>
                      <Badge variant="outline">
                        Offer: {formatCurrency(bid.offeredPriceCents, bid.currency)} / {bid.pool.unit}
                      </Badge>
                      <Badge variant="outline">
                        {bid.pool.currentQuantity}/{bid.pool.targetQuantity}{bid.pool.unit}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Best practices</CardTitle>
          <CardDescription>Ship the deal fast once the pool locks.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Tip title="Join the room" body="Use the pool chat to align specs, lead times, and packaging." />
          <Tip title="Offer tiers" body="Bid competitively as fill % rises—buyers love real-time drops." />
          <Tip title="Be explicit" body="State constraints (MOQ, max quantity, incoterms) to avoid churn." />
        </CardContent>
      </Card>
    </div>
  );
}

function Tip({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
