"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { Share2 } from "lucide-react";

import CopyButton from "@/components/derived/copy-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PoolShareDialog({
  poolId,
  title,
  referralId,
}: {
  poolId: string;
  title: string;
  referralId: string;
}) {
  const [open, setOpen] = useState(false);
  const [includeReferral, setIncludeReferral] = useState(true);

  const qrRef = useRef<HTMLDivElement | null>(null);
  const qr = useRef<QRCodeStyling | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";

    const url = new URL(`/pools/${poolId}`, window.location.origin);
    if (includeReferral && referralId) {
      url.searchParams.set("ref", referralId);
    }

    return url.toString();
  }, [includeReferral, poolId, referralId]);

  const whatsappHref = useMemo(() => {
    const msg = `BulkBuddy pool: ${title}\n${shareUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }, [shareUrl, title]);

  useEffect(() => {
    if (!open) return;
    if (!shareUrl) return;
    if (!qrRef.current) return;

    qrRef.current.innerHTML = "";

    if (!qr.current) {
      qr.current = new QRCodeStyling({
        width: 220,
        height: 220,
        data: shareUrl,
        dotsOptions: { color: "#000", type: "rounded" },
        backgroundOptions: { color: "#fff" },
      });
    } else {
      qr.current.update({ data: shareUrl });
    }

    try {
      qr.current.append(qrRef.current);
    } catch {
      // ignore
    }
  }, [open, shareUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Share2 className="h-4 w-4" />
        Share
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] w-11/12">
        <DialogHeader>
          <DialogTitle>Share this pool</DialogTitle>
          <DialogDescription>Send a link or let others scan a QR code.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="poolShareUrl">Link</Label>
            <div className="flex gap-2">
              <Input id="poolShareUrl" value={shareUrl} readOnly />
              <CopyButton textToCopy={shareUrl} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeReferral}
                onChange={(e) => setIncludeReferral(e.target.checked)}
                className="h-4 w-4"
              />
              Include my referral tag
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                render={<a href={whatsappHref} target="_blank" rel="noreferrer" />}
                variant="secondary"
                type="button"
              >
                Share to WhatsApp
              </Button>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm font-medium">QR code</p>
            <p className="text-xs text-muted-foreground">Scan to open this pool.</p>
            <div className="mt-3 flex items-center justify-center">
              <div ref={qrRef} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
