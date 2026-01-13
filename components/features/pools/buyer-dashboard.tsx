"use client";

import { useMemo } from "react";
import { ArrowUpRight, Box, DollarSign, Package, TrendingDown, Users } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { Separator } from "@/components/ui/separator";
import { createPool, joinPool } from "@/lib/pools";
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
  } | null;
  myPools: BuyerPool[];
  availablePools: BuyerPool[];
  activity: { id: string; message: string; createdAt: Date | number | string }[];
};

const formatCurrency = (cents: number, currency: string) => {
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
};

export function BuyerDashboardClient({ stats, myPools, availablePools, activity }: DashboardProps) {
  const totalPools = useMemo(() => myPools.length, [myPools.length]);

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
              <form action={createPool} className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input name="title" placeholder="Pool title" required />
                  <Input name="material" placeholder="Material (Steel, HDPE)" required />
                  <Input name="specification" placeholder="Specification (grade, size)" />
                  <Input name="unit" placeholder="Unit (kg, ton)" defaultValue="kg" />
                  <Input name="targetQuantity" type="number" placeholder="Target quantity" required />
                  <Input name="initialQuantity" type="number" placeholder="Your quantity" />
                  <Input name="minFillPercent" type="number" placeholder="Minimum fill %" defaultValue={60} />
                  <Input name="retailPrice" type="number" step="0.01" placeholder="Retail price per unit" required />
                  <Input name="currency" placeholder="Currency" defaultValue="USD" />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <Input name="tier1Percent" type="number" defaultValue={60} placeholder="Tier 1 %" />
                  <Input name="tier1Price" type="number" step="0.01" placeholder="Tier 1 price" />
                  <Input name="tier2Percent" type="number" defaultValue={80} placeholder="Tier 2 %" />
                  <Input name="tier2Price" type="number" step="0.01" placeholder="Tier 2 price" />
                  <Input name="tier3Percent" type="number" defaultValue={100} placeholder="Tier 3 %" />
                  <Input name="tier3Price" type="number" step="0.01" placeholder="Tier 3 price" />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-3">
                  <Input name="locationCity" placeholder="City" />
                  <Input name="locationState" placeholder="State" />
                  <Input name="locationCountry" placeholder="Country" />
                </div>

                <CredenzaFooter className="justify-end">
                  <Button type="submit">Create pool</Button>
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
          <CardTitle>Available pools</CardTitle>
          <CardDescription>Join nearby pools to unlock better pricing.</CardDescription>
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
              <form action={joinPool} className="flex gap-2">
                <input type="hidden" name="poolId" value={pool.id} />
                <Input name="quantity" type="number" min={1} placeholder={`Qty (${pool.unit})`} required />
                <Button type="submit" variant="secondary">Join</Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
