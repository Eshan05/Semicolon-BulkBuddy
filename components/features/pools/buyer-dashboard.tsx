"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { ArrowUpRight, Box, DollarSign, Package, TrendingDown, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { Separator } from "@/components/ui/separator";
import { createPoolAction, joinPoolAction } from "@/lib/pools";
import { cn } from "@/lib/utils";

export type BuyerPool = {
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

type DashboardProps = {
  stats: {
    totalSavingsCents: number;
    activePools: number;
    lockedPools: number;
    referralsEarned?: number;
    referralCreditsPct?: number;
  } | null;
  myPools: BuyerPool[];
  availablePools: BuyerPool[];
  activity: { id: string; message: string; createdAt: Date | number | string }[];
  scope: "all" | "country" | "state" | "city";
  locationLabel: string | null;
};

const formatCurrency = (cents: number, currency: string) => {
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
};

export function BuyerDashboardClient({ stats, myPools, availablePools, activity, scope, locationLabel }: DashboardProps) {
  const totalPools = useMemo(() => myPools.length, [myPools.length]);

  const createFormRef = useRef<HTMLFormElement | null>(null);

  const fillCreatePoolSample = () => {
    const form = createFormRef.current;
    if (!form) return;

    const setValue = (name: string, value: string | number) => {
      const el = form.elements.namedItem(name);
      if (!el) return;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.value = String(value);
      }
    };

    const now = new Date();
    setValue("title", `Steel billets – ${now.toLocaleString("en", { month: "short" })} buy`);
    setValue("material", "Steel");
    setValue("specification", "Grade S275 – 6m lengths");
    setValue("unit", "kg");
    setValue("targetQuantity", 1000);
    setValue("initialQuantity", 200);
    setValue("minFillPercent", 60);
    setValue("retailPrice", 3.5);
    setValue("currency", "USD");
    setValue("locationCity", "Lagos");
    setValue("locationState", "Lagos");
    setValue("locationCountry", "Nigeria");
  };

  const [createResult, createAction, createPending] = useActionState(createPoolAction, null);
  const [joinResult, joinAction, joinPending] = useActionState(joinPoolAction, null);

  useEffect(() => {
    if (!createResult) return;
    if (createResult.ok) toast.success("Pool created");
    else toast.error(createResult.error);
  }, [createResult]);

  useEffect(() => {
    if (!joinResult) return;
    if (joinResult.ok) toast.success("Joined pool");
    else toast.error(joinResult.error);
  }, [joinResult]);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Track your pools, pricing progress, and supplier offers.</p>
        </div>
        <Credenza>
          <CredenzaTrigger className={cn(buttonVariants({}), "w-fit")}>Create pool</CredenzaTrigger>
          <CredenzaContent className="max-w-3xl">
            <CredenzaHeader>
              <CredenzaTitle>Create a new pool</CredenzaTitle>
            </CredenzaHeader>
            <CredenzaBody className="max-h-[70vh] overflow-y-auto">
              <form ref={createFormRef} action={createAction} className="grid gap-4">
                {process.env.NODE_ENV === "development" ? (
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" onClick={fillCreatePoolSample}>
                      Dev: quick fill
                    </Button>
                  </div>
                ) : null}
                <div className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Basics</p>
                  <p className="text-xs text-muted-foreground">What are you pooling, and what counts as “the same spec”?</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="pool-title">Pool title</Label>
                      <Input id="pool-title" name="title" placeholder="e.g. Steel billets – Q1 purchase" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pool-material">Material</Label>
                      <Input id="pool-material" name="material" placeholder="e.g. Steel, HDPE, Copper" required />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="pool-spec">Specification (optional)</Label>
                      <Input id="pool-spec" name="specification" placeholder="e.g. grade, size, tolerance, packaging" />
                      <p className="text-xs text-muted-foreground">Tip: keep this precise to avoid spec mismatches.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Quantity & pricing</p>
                  <p className="text-xs text-muted-foreground">Set the target and the current retail baseline.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="pool-unit">Unit</Label>
                      <Input id="pool-unit" name="unit" placeholder="kg" defaultValue="kg" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pool-target">Target quantity</Label>
                      <Input id="pool-target" name="targetQuantity" type="number" min={1} step={1} placeholder="e.g. 1000" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pool-initial">Your quantity (optional)</Label>
                      <Input id="pool-initial" name="initialQuantity" type="number" min={0} step={1} placeholder="e.g. 200" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="pool-minfill">Minimum fill %</Label>
                      <Input id="pool-minfill" name="minFillPercent" type="number" min={1} max={100} step={1} placeholder="60" defaultValue={60} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pool-retail">Retail price / unit</Label>
                      <Input id="pool-retail" name="retailPrice" type="number" min={0} step="0.01" placeholder="e.g. 3.50" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pool-currency">Currency</Label>
                      <Input id="pool-currency" name="currency" placeholder="USD" defaultValue="USD" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Discount tiers</p>
                  <p className="text-xs text-muted-foreground">As the pool fills, the unit price drops.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="tier1Percent">Tier 1 threshold (%)</Label>
                      <Input id="tier1Percent" name="tier1Percent" type="number" min={1} max={200} step={1} defaultValue={60} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tier1Price">Tier 1 price / unit</Label>
                      <Input id="tier1Price" name="tier1Price" type="number" min={0} step="0.01" placeholder="auto" />
                    </div>
                    <div className="hidden md:block" />

                    <div className="grid gap-2">
                      <Label htmlFor="tier2Percent">Tier 2 threshold (%)</Label>
                      <Input id="tier2Percent" name="tier2Percent" type="number" min={1} max={200} step={1} defaultValue={80} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tier2Price">Tier 2 price / unit</Label>
                      <Input id="tier2Price" name="tier2Price" type="number" min={0} step="0.01" placeholder="auto" />
                    </div>
                    <div className="hidden md:block" />

                    <div className="grid gap-2">
                      <Label htmlFor="tier3Percent">Tier 3 threshold (%)</Label>
                      <Input id="tier3Percent" name="tier3Percent" type="number" min={1} max={200} step={1} defaultValue={100} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tier3Price">Tier 3 price / unit</Label>
                      <Input id="tier3Price" name="tier3Price" type="number" min={0} step="0.01" placeholder="auto" />
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-3">
                      Leave tier prices empty to use the suggested defaults.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-semibold">Location (optional)</p>
                  <p className="text-xs text-muted-foreground">Used for matching nearby SMEs and suppliers.</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="locationCity">City</Label>
                      <Input id="locationCity" name="locationCity" placeholder="City" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="locationState">State/Region</Label>
                      <Input id="locationState" name="locationState" placeholder="State" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="locationCountry">Country</Label>
                      <Input id="locationCountry" name="locationCountry" placeholder="Country" />
                    </div>
                  </div>
                </div>

                <CredenzaFooter className="justify-end">
                  <Button type="submit" disabled={createPending}>
                    {createPending ? "Creating…" : "Create pool"}
                  </Button>
                </CredenzaFooter>
              </form>
            </CredenzaBody>
          </CredenzaContent>
        </Credenza>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalSavingsCents, "USD") : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Based on current pool prices</p>
            {stats?.referralCreditsPct ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Referral bonus: {stats.referralCreditsPct}% off next order (MVP)
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePools ?? 0}</div>
            <p className="text-xs text-muted-foreground">{totalPools} total pools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Pools</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lockedPools ?? 0}</div>
            <p className="text-xs text-muted-foreground">Ready to fulfill</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Unit Price</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myPools.length
                ? formatCurrency(
                  Math.round(
                    myPools.reduce((acc, pool) => acc + pool.currentPriceCents, 0) / myPools.length,
                  ),
                  "USD",
                )
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">Based on joined pools</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>My pools</CardTitle>
            <CardDescription>Real-time status of pools you participate in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {myPools.length === 0 && (
              <p className="text-sm text-muted-foreground">You have not joined any pools yet.</p>
            )}
            {myPools.map((pool) => (
              <div key={pool.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{pool.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {pool.material} • {pool.currentQuantity}/{pool.targetQuantity}{pool.unit}
                      {pool.location ? ` • ${pool.location}` : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={pool.status === "locked" ? "default" : "secondary"}>
                        {pool.status}
                      </Badge>
                      <Badge variant="outline">
                        {pool.participantsCount} participants
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden w-36 flex-col items-end gap-1 sm:flex">
                      <span className="text-xs font-medium">{pool.progress.toFixed(0)}% Filled</span>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${pool.progress}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Current price</p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(pool.currentPriceCents, pool.currency)} / {pool.unit}
                      </p>
                    </div>
                    <Link
                      href={`/pools/${pool.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Updates across your pools.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{item.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Available pools</CardTitle>
              <CardDescription>Join nearby pools to unlock better pricing.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard?scope=country"
                className={cn(buttonVariants({ size: "sm", variant: scope === "country" ? "default" : "outline" }))}
              >
                Nearby
              </Link>
              <Link
                href="/dashboard?scope=state"
                className={cn(buttonVariants({ size: "sm", variant: scope === "state" ? "default" : "outline" }))}
              >
                Same state
              </Link>
              <Link
                href="/dashboard?scope=city"
                className={cn(buttonVariants({ size: "sm", variant: scope === "city" ? "default" : "outline" }))}
              >
                Same city
              </Link>
              <Link
                href="/dashboard?scope=all"
                className={cn(buttonVariants({ size: "sm", variant: scope === "all" ? "default" : "outline" }))}
              >
                All
              </Link>
            </div>
          </div>
          {locationLabel ? (
            <p className="text-xs text-muted-foreground">Matching against {locationLabel}</p>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availablePools.length === 0 && (
            <p className="text-sm text-muted-foreground">No available pools at the moment.</p>
          )}
          {availablePools.map((pool) => (
            <div key={pool.id} className="rounded-xl border p-4 flex flex-col gap-3">
              <div>
                <p className="text-sm font-medium">{pool.title}</p>
                <p className="text-xs text-muted-foreground">
                  {pool.material} • {pool.currentQuantity}/{pool.targetQuantity}{pool.unit}
                </p>
                {pool.location && (
                  <p className="text-xs text-muted-foreground">{pool.location}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current price</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(pool.currentPriceCents, pool.currency)} / {pool.unit}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {pool.participantsCount}
                </Badge>
              </div>
              <div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${pool.progress}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pool.progress.toFixed(0)}% filled
                </p>
              </div>
              <form action={joinAction} className="flex gap-2">
                <input type="hidden" name="poolId" value={pool.id} />
                <Input
                  name="quantity"
                  type="number"
                  min={1}
                  placeholder={`Qty (${pool.unit})`}
                  required
                  defaultValue={process.env.NODE_ENV === "development" ? 100 : undefined}
                />
                <Button type="submit" variant="secondary" disabled={joinPending}>
                  {joinPending ? "Joining…" : "Join"}
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
