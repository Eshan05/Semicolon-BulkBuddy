"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, Copy, MessageCircle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startDirectThread } from "@/lib/messages";
import { joinPool, PoolDetails, sendPoolMessage, submitSupplierBid } from "@/lib/pools";
import { cn } from "@/lib/utils";

type PoolState = PoolDetails;

const formatCurrency = (cents: number, currency: string) => {
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
};

export function PoolRoom({
  initialPool,
  me,
}: {
  initialPool: PoolState;
  me: { id: string; role: string | null };
}) {
  const [pool, setPool] = useState<PoolState>(initialPool);
  const [polling, setPolling] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastMilestoneRef = useRef<string | null>(null);

  const progress = useMemo(() => Number(pool.progress ?? 0), [pool.progress]);
  const location = useMemo(
    () => [pool.locationCity, pool.locationState, pool.locationCountry].filter(Boolean).join(", "),
    [pool.locationCity, pool.locationState, pool.locationCountry],
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/pools/${pool.id}/state`, { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { pool: PoolState };

      const next = json.pool;
      // milestone toast
      const latestMilestone = (next.activities || []).find((a: any) => a.type === "milestone");
      if (latestMilestone?.id && latestMilestone.id !== lastMilestoneRef.current) {
        lastMilestoneRef.current = latestMilestone.id;
        toast(latestMilestone.message);
      }

      setPool(next);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    lastMilestoneRef.current = (pool.activities || []).find((a: any) => a.type === "milestone")?.id ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(() => {
      void refresh();
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling, pool.id]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Pool link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const sortedMessages = useMemo(() => {
    const msgs = Array.isArray(pool.messages) ? [...pool.messages] : [];
    // current query comes back desc; show asc
    return msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [pool.messages]);

  const participants = useMemo(() => {
    const ps = Array.isArray(pool.participants) ? pool.participants : [];
    return ps
      .map((p: any) => ({
        id: p.id,
        userId: p.userId,
        quantity: p.quantity,
        participantType: p.participantType,
        commitStatus: p.commitStatus,
        user: p.user,
      }))
      .sort((a: any, b: any) => (b.quantity || 0) - (a.quantity || 0));
  }, [pool.participants]);

  const bids = useMemo(() => {
    const bs = Array.isArray(pool.supplierBids) ? pool.supplierBids : [];
    return bs.map((b: any) => ({
      id: b.id,
      supplierId: b.supplierId,
      offeredPriceCents: b.offeredPriceCents,
      currency: b.currency,
      maxQuantity: b.maxQuantity,
      notes: b.notes,
      status: b.status,
      supplier: b.supplier,
    }));
  }, [pool.supplierBids]);

  const buyers = participants.filter((p: any) => p.participantType === "buyer");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight truncate">{pool.title}</h1>
          <p className="text-muted-foreground">
            {pool.material}
            {pool.specification ? ` • ${pool.specification}` : ""} • {pool.currentQuantity}/{pool.targetQuantity}{pool.unit}
            {location ? ` • ${location}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={pool.status === "locked" ? "default" : "secondary"}>{pool.status}</Badge>
            <Badge variant="outline">{buyers.length} buyers</Badge>
            <Badge variant="outline">{bids.length} supplier offers</Badge>
            <Badge variant="outline">Target {pool.minFillPercent}%</Badge>
          </div>
          <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${Math.min(progress, 200)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% filled</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={copyLink}>
            <Copy className="h-4 w-4" />
            Share
          </Button>
          <Button type="button" variant="outline" onClick={() => setPolling((p) => !p)}>
            <RefreshCw className={cn("h-4 w-4", polling ? "animate-spin" : "")} />
            {polling ? "Live" : "Paused"}
          </Button>
          <Button type="button" variant="secondary" disabled={refreshing} onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dynamic pricing</CardTitle>
            <CardDescription>Price per unit drops as the pool fills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Current price</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(pool.currentPriceCents, pool.currency)} / {pool.unit}
              </p>
              <p className="text-xs text-muted-foreground">
                Retail {formatCurrency(pool.retailPriceCents, pool.currency)} / {pool.unit}
              </p>
            </div>
            <div className="space-y-2">
              {(pool.priceTiers || []).map((tier: any) => (
                <div key={tier.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{tier.minPercent}% filled</span>
                  <span className="font-medium">
                    {formatCurrency(tier.pricePerUnitCents, tier.currency)} / {pool.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join this pool</CardTitle>
            <CardDescription>Contribute your required quantity (with optional soft commitment).</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={joinPool} className="flex flex-col gap-3">
              <input type="hidden" name="poolId" value={pool.id} />
              <Input name="quantity" type="number" min={1} placeholder={`Quantity (${pool.unit})`} required />

              <label className="flex items-center gap-2 text-sm">
                <input name="commit" value="true" type="checkbox" className="h-4 w-4" />
                Soft commit (signals you won't back out)
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input name="splitExcess" value="true" type="checkbox" className="h-4 w-4" />
                If I oversubscribe, split the excess into a new pool
              </label>

              <Button type="submit">Join pool</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="buyers" className="flex-1">Buyers</TabsTrigger>
          <TabsTrigger value="offers" className="flex-1">Supplier offers</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pool chat</CardTitle>
              <CardDescription>Coordinate with buyers and suppliers in near real time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg border p-4 max-h-[55vh] overflow-y-auto">
                {sortedMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
                {sortedMessages.map((m: any) => {
                  const author = m.isAnonymous
                    ? (m.displayName || "Anonymous")
                    : (m.sender?.name || m.sender?.email || "User");

                  return (
                    <div key={m.id} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{author} • {m.senderRole}</p>
                      <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                    </div>
                  );
                })}
              </div>

              <form action={sendPoolMessage} className="grid gap-2">
                <input type="hidden" name="poolId" value={pool.id} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input name="anonymous" value="true" type="checkbox" className="h-4 w-4" />
                    Send anonymously
                  </label>
                  <Input name="displayName" placeholder="Anonymous display name (optional)" />
                </div>
                <Input name="message" placeholder="Type a message" required />
                <Button type="submit" variant="secondary">Send message</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buyers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Buyers in this pool</CardTitle>
              <CardDescription>Contact buyers directly, or coordinate in chat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {buyers.length === 0 && (
                <p className="text-sm text-muted-foreground">No buyers yet.</p>
              )}

              {buyers.map((p: any) => (
                <div key={p.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.user?.name || p.user?.email || "Buyer"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.quantity}{pool.unit}
                      {p.commitStatus === "soft" ? " • soft commit" : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.userId && p.userId !== me.id && (
                      <form action={startDirectThread}>
                        <input type="hidden" name="otherUserId" value={p.userId} />
                        <Button type="submit" size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </form>
                    )}
                    {p.userId && (
                      <Link
                        href={`/profiles/${p.userId}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                      >
                        View profile
                      </Link>
                    )}
                    <Link
                      href={`/pools/${pool.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                      title="Open pool"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Supplier offers</CardTitle>
                <CardDescription>Compare bids side-by-side.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bids.length === 0 && (
                  <p className="text-sm text-muted-foreground">No supplier offers yet.</p>
                )}

                {bids.map((b: any) => {
                  const max = b.maxQuantity ? `${b.maxQuantity}${pool.unit}` : "—";
                  const potential = b.maxQuantity
                    ? `${Math.min(((pool.currentQuantity + b.maxQuantity) / pool.targetQuantity) * 100, 999).toFixed(0)}%`
                    : null;

                  return (
                    <div key={b.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {b.supplier?.name || b.supplier?.email || "Supplier"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(b.offeredPriceCents, b.currency)} / {pool.unit} • max {max}
                            {potential ? ` • could cover up to ${potential}` : ""}
                          </p>
                          {b.notes && <p className="mt-2 text-sm whitespace-pre-wrap">{b.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">{b.status}</Badge>
                          {b.supplierId && b.supplierId !== me.id && (
                            <form action={startDirectThread}>
                              <input type="hidden" name="otherUserId" value={b.supplierId} />
                              <Button type="submit" size="sm" variant="outline">
                                Message
                              </Button>
                            </form>
                          )}
                          {b.supplierId && (
                            <Link
                              href={`/profiles/${b.supplierId}`}
                              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                            >
                              View profile
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit an offer</CardTitle>
                <CardDescription>Suppliers can join the pool by proposing a bid.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(me.role === "supplier" || me.role === "admin") ? (
                  <form action={submitSupplierBid} className="grid gap-3">
                    <input type="hidden" name="poolId" value={pool.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input name="offeredPrice" type="number" step="0.01" placeholder="Offered price per unit" required />
                      <Input name="currency" placeholder="Currency" defaultValue={pool.currency} />
                      <Input name="maxQuantity" type="number" placeholder={`Max quantity you can fulfill (${pool.unit})`} />
                      <Input name="notes" placeholder="Notes (lead time, terms, etc)" />
                    </div>
                    <Button type="submit">Submit offer</Button>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">Only supplier accounts can submit offers.</p>
                )}

                <Separator />

                <div className="grid gap-3 md:grid-cols-3">
                  <Info label="Spec" value={pool.specification || "Not provided"} />
                  <Info label="Location" value={location || "Not specified"} />
                  <Info label="Min fill" value={`${pool.minFillPercent}%`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Milestones, joins, bids, and system updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(pool.activities || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              )}
              {(pool.activities || []).map((a: any) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  {a.message}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
