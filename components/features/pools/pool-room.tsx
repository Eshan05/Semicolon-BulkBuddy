"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, MessageCircle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PoolParticipantsMap, type PoolMapMarker } from "@/components/features/pools/pool-participants-map";
import { PoolShareDialog } from "@/components/features/pools/pool-share-dialog";
import { startDirectThread } from "@/lib/messages";
import {
  acceptSupplierBidAction,
  joinPoolAction,
  PoolDetails,
  sendPoolMessageAction,
  submitPoolVibeCheckAction,
  submitSupplierBidAction,
} from "@/lib/pools";
import { cn } from "@/lib/utils";

type PoolState = PoolDetails;

const formatCurrency = (cents: number, currency: string) => {
  const value = (cents / 100).toFixed(2);
  return `${currency} ${value}`;
};

export function PoolRoom({
  initialPool,
  me,
  supportContact,
}: {
  initialPool: PoolState;
  me: { id: string; role: string | null };
  supportContact?: { id: string; name: string | null; email: string | null } | null;
}) {
  const [pool, setPool] = useState<PoolState>(initialPool);
  const [polling, setPolling] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastMilestoneRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const refFromUrl = (searchParams?.get("ref") || "").trim();

  const [joinResult, joinAction, joinPending] = useActionState(joinPoolAction, null);
  const [messageResult, messageAction, messagePending] = useActionState(sendPoolMessageAction, null);
  const [bidResult, bidAction, bidPending] = useActionState(submitSupplierBidAction, null);
  const [acceptResult, acceptAction, acceptPending] = useActionState(acceptSupplierBidAction, null);
  const [vibeResult, vibeAction, vibePending] = useActionState(submitPoolVibeCheckAction, null);

  useEffect(() => {
    if (!joinResult) return;
    if (joinResult.ok) toast.success("Joined pool");
    else toast.error(joinResult.error);
  }, [joinResult]);

  useEffect(() => {
    if (!messageResult) return;
    if (messageResult.ok) toast.success("Message sent");
    else toast.error(messageResult.error);
  }, [messageResult]);

  useEffect(() => {
    if (!bidResult) return;
    if (bidResult.ok) toast.success("Offer submitted");
    else toast.error(bidResult.error);
  }, [bidResult]);

  useEffect(() => {
    if (!acceptResult) return;
    if (acceptResult.ok) toast.success("Offer accepted");
    else toast.error(acceptResult.error);
  }, [acceptResult]);

  useEffect(() => {
    if (!vibeResult) return;
    if (vibeResult.ok) toast.success("Vibe check submitted");
    else toast.error(vibeResult.error);
  }, [vibeResult]);

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
        isAnonymous: Boolean(p.isAnonymous),
        displayName: p.displayName ?? null,
        specNotes: p.specNotes ?? null,
        commitStatus: p.commitStatus,
        user: p.user,
        company: p.company ?? null,
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
      supplierCompany: b.supplierCompany ?? null,
    }));
  }, [pool.supplierBids]);

  const bestOpenBidId = useMemo(() => {
    const open = bids.filter((b: any) => b.status === "open" && typeof b.offeredPriceCents === "number");
    if (!open.length) return null;
    open.sort((a: any, b: any) => (a.offeredPriceCents ?? 0) - (b.offeredPriceCents ?? 0));
    return open[0]?.id ?? null;
  }, [bids]);

  const mapMarkers = useMemo(() => {
    const markers: PoolMapMarker[] = [];

    for (const p of participants) {
      const company = p.company;
      if (company?.lat == null || company?.lng == null) continue;

      const canReveal =
        !p.isAnonymous ||
        pool.status === "locked" ||
        p.userId === me.id ||
        me.role === "admin" ||
        pool.creatorId === me.id;

      const title = p.isAnonymous && !canReveal
        ? (p.displayName || "Anonymous")
        : (company.companyName || p.user?.name || p.user?.email || p.displayName || "Buyer");

      const subtitle = [company.city, company.state, company.country].filter(Boolean).join(", ") || null;

      markers.push({
        id: `buyer-${p.id}`,
        type: "buyer",
        lat: company.lat,
        lng: company.lng,
        title,
        subtitle,
      });
    }

    for (const b of bids) {
      const company = b.supplierCompany;
      if (company?.lat == null || company?.lng == null) continue;
      const title = company.companyName || b.supplier?.name || b.supplier?.email || "Supplier";
      const subtitle = [company.city, company.state, company.country].filter(Boolean).join(", ") || null;

      markers.push({
        id: `supplier-${b.id}`,
        type: "supplier",
        lat: company.lat,
        lng: company.lng,
        title,
        subtitle,
      });
    }

    return markers;
  }, [bids, me.id, me.role, participants, pool.creatorId, pool.status]);

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
          <PoolShareDialog poolId={pool.id} title={pool.title} referralId={me.id} />
          {supportContact?.id ? (
            <form action={startDirectThread}>
              <input type="hidden" name="otherUserId" value={supportContact.id} />
              <Button type="submit" variant="outline">Contact support</Button>
            </form>
          ) : null}
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
            <form action={joinAction} className="flex flex-col gap-3">
              <input type="hidden" name="poolId" value={pool.id} />
              {refFromUrl ? <input type="hidden" name="ref" value={refFromUrl} /> : null}
              <Input
                name="quantity"
                type="number"
                min={1}
                placeholder={`Quantity (${pool.unit})`}
                required
                defaultValue={process.env.NODE_ENV === "development" ? 100 : undefined}
              />

              <Input
                name="specNotes"
                placeholder="Spec notes (optional)"
                defaultValue={process.env.NODE_ENV === "development" ? "OK with equivalent grade" : undefined}
              />

              <label className="flex items-center gap-2 text-sm">
                <input name="anonymousJoin" value="true" type="checkbox" className="h-4 w-4" />
                Join anonymously (revealed when pool locks)
              </label>
              <Input
                name="displayName"
                placeholder="Anonymous display name (optional)"
                defaultValue={process.env.NODE_ENV === "development" ? "AnonCo" : undefined}
              />

              <label className="flex items-center gap-2 text-sm">
                <input name="commit" value="true" type="checkbox" className="h-4 w-4" />
                Soft commit (signals you won't back out)
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input name="splitExcess" value="true" type="checkbox" className="h-4 w-4" />
                If I oversubscribe, split the excess into a new pool
              </label>

              <Button type="submit" disabled={joinPending}>
                {joinPending ? "Joining…" : "Join pool"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="w-full" variant="line">
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="buyers" className="flex-1">Buyers</TabsTrigger>
          <TabsTrigger value="map" className="flex-1">Map</TabsTrigger>
          <TabsTrigger value="offers" className="flex-1">Supplier offers</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          <TabsTrigger value="vibe" className="flex-1">Vibe check</TabsTrigger>
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

              <form action={messageAction} className="grid gap-2">
                <input type="hidden" name="poolId" value={pool.id} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input name="anonymous" value="true" type="checkbox" className="h-4 w-4" />
                    Send anonymously
                  </label>
                  <Input name="displayName" placeholder="Anonymous display name (optional)" />
                </div>
                <Input name="message" placeholder="Type a message" required />
                <Button type="submit" variant="secondary" disabled={messagePending}>
                  {messagePending ? "Sending…" : "Send message"}
                </Button>
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
                    {(() => {
                      const canReveal =
                        !p.isAnonymous ||
                        pool.status === "locked" ||
                        p.userId === me.id ||
                        me.role === "admin" ||
                        pool.creatorId === me.id;

                      const label = p.isAnonymous && !canReveal
                        ? (p.displayName || "Anonymous")
                        : (p.user?.name || p.user?.email || p.displayName || "Buyer");

                      return (
                        <p className="truncate text-sm font-medium">
                          {label}
                          {p.isAnonymous && !canReveal ? " (anonymous)" : ""}
                        </p>
                      );
                    })()}
                    <p className="text-xs text-muted-foreground">
                      {p.quantity}{pool.unit}
                      {p.commitStatus === "soft" ? " • soft commit" : ""}
                    </p>
                    {(() => {
                      if (!p.specNotes) return null;
                      const canReveal =
                        !p.isAnonymous ||
                        pool.status === "locked" ||
                        p.userId === me.id ||
                        me.role === "admin" ||
                        pool.creatorId === me.id;

                      if (!canReveal) return null;

                      return (
                        <p className="text-xs text-muted-foreground truncate">
                          Spec notes: {p.specNotes}
                        </p>
                      );
                    })()}
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

        <TabsContent value="map" className="mt-4">
          <PoolParticipantsMap markers={mapMarkers} />
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

                {bids.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Max</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids
                        .slice()
                        .sort((a: any, b: any) => {
                          const as = a.status === "accepted" || a.status === "accepted_partial" ? 0 : 1;
                          const bs = b.status === "accepted" || b.status === "accepted_partial" ? 0 : 1;
                          if (as !== bs) return as - bs;
                          return (a.offeredPriceCents ?? 0) - (b.offeredPriceCents ?? 0);
                        })
                        .map((b: any) => {
                          const max = b.maxQuantity ? `${b.maxQuantity}${pool.unit}` : "—";
                          const isOwner = me.role === "admin" || pool.creatorId === me.id;
                          const statusLabel = b.status === "accepted_partial" ? "accepted (partial)" : b.status;
                          const isBest = b.status === "open" && bestOpenBidId && b.id === bestOpenBidId;
                          const deltaCents = typeof b.offeredPriceCents === "number"
                            ? (pool.currentPriceCents - b.offeredPriceCents)
                            : null;

                          return (
                            <TableRow
                              key={b.id}
                              className={cn(
                                b.status === "accepted" || b.status === "accepted_partial" ? "bg-emerald-500/5" : "",
                              )}
                            >
                              <TableCell className="min-w-48">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {b.supplier?.name || b.supplier?.email || "Supplier"}
                                  </p>
                                  {b.notes ? (
                                    <p className="text-xs text-muted-foreground truncate max-w-[36ch]">{b.notes}</p>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm font-medium">{formatCurrency(b.offeredPriceCents, b.currency)} / {pool.unit}</p>
                                {deltaCents != null && deltaCents > 0 ? (
                                  <p className="text-xs text-muted-foreground">Save {formatCurrency(deltaCents, b.currency)} / {pool.unit}</p>
                                ) : null}
                              </TableCell>
                              <TableCell>{max}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={b.status === "accepted" || b.status === "accepted_partial" ? "default" : "outline"}
                                  className="capitalize"
                                >
                                  {statusLabel}
                                </Badge>
                                {isBest ? <Badge variant="secondary" className="ml-2">Best</Badge> : null}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-wrap justify-end gap-2">
                                  {isOwner && b.status !== "accepted" && b.status !== "accepted_partial" && (
                                    <form action={acceptAction}>
                                      <input type="hidden" name="poolId" value={pool.id} />
                                      <input type="hidden" name="bidId" value={b.id} />
                                      <Button type="submit" size="sm" disabled={acceptPending}>
                                        {acceptPending ? "Accepting…" : "Accept"}
                                      </Button>
                                    </form>
                                  )}
                                  {b.supplierId && b.supplierId !== me.id && (
                                    <form action={startDirectThread}>
                                      <input type="hidden" name="otherUserId" value={b.supplierId} />
                                      <Button type="submit" size="sm" variant="outline">Message</Button>
                                    </form>
                                  )}
                                  {b.supplierId && (
                                    <Link
                                      href={`/profiles/${b.supplierId}`}
                                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                                    >
                                      Profile
                                    </Link>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit an offer</CardTitle>
                <CardDescription>Suppliers can join the pool by proposing a bid.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(me.role === "supplier" || me.role === "admin") ? (
                  <form action={bidAction} className="grid gap-3">
                    <input type="hidden" name="poolId" value={pool.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input name="offeredPrice" type="number" step="0.01" placeholder="Offered price per unit" required />
                      <Input name="currency" placeholder="Currency" defaultValue={pool.currency} />
                      <Input name="maxQuantity" type="number" placeholder={`Max quantity you can fulfill (${pool.unit})`} />
                      <Input name="notes" placeholder="Notes (lead time, terms, etc)" />
                    </div>
                    <Button type="submit" disabled={bidPending}>
                      {bidPending ? "Submitting…" : "Submit offer"}
                    </Button>
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

        <TabsContent value="vibe" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Post-pool vibe check</CardTitle>
              <CardDescription>
                Quick feedback after the pool locks. This improves trust signals on profiles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Info label="Responses" value={`${pool.vibeSummary?.total ?? 0}`} />
                <Info label="Specs matched" value={`${pool.vibeSummary?.matchedSpecsPct ?? 0}%`} />
                <Info label="Chat helpful" value={`${pool.vibeSummary?.chatHelpfulPct ?? 0}%`} />
                <Info label="Would pool again" value={`${pool.vibeSummary?.wouldPoolAgainPct ?? 0}%`} />
              </div>

              {pool.status !== "locked" ? (
                <p className="text-sm text-muted-foreground">Vibe check opens once the pool locks.</p>
              ) : pool.myVibeCheckSubmitted ? (
                <p className="text-sm text-muted-foreground">Thanks — you already submitted your vibe check.</p>
              ) : (
                <form action={vibeAction} className="grid gap-4">
                  <input type="hidden" name="poolId" value={pool.id} />

                  <fieldset className="grid gap-2 rounded-lg border p-3">
                    <legend className="text-sm font-medium">Specs matched?</legend>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="matchedSpecs" value="true" required className="h-4 w-4" />
                        Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="matchedSpecs" value="false" required className="h-4 w-4" />
                        No
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="grid gap-2 rounded-lg border p-3">
                    <legend className="text-sm font-medium">Was the chat helpful?</legend>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="chatHelpful" value="true" required className="h-4 w-4" />
                        Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="chatHelpful" value="false" required className="h-4 w-4" />
                        No
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="grid gap-2 rounded-lg border p-3">
                    <legend className="text-sm font-medium">Would you pool again?</legend>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="wouldPoolAgain" value="true" required className="h-4 w-4" />
                        Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="wouldPoolAgain" value="false" required className="h-4 w-4" />
                        No
                      </label>
                    </div>
                  </fieldset>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium" htmlFor="vibe-comment">Optional note</label>
                    <Textarea id="vibe-comment" name="comment" placeholder="Any context that would help future pools?" />
                  </div>

                  <Button type="submit" variant="secondary" disabled={vibePending}>
                    {vibePending ? "Submitting…" : "Submit vibe check"}
                  </Button>
                </form>
              )}
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
