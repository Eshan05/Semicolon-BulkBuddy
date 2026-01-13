"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuBell as Bell } from "react-icons/lu";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  readAt: Date | number | string | null;
  createdAt: Date | number | string;
};

export default function NotificationsItem() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const json = (await res.json()) as { notifications: Notif[]; unreadCount: number };
        if (!active) return;
        setItems(json.notifications || []);
        setUnread(json.unreadCount || 0);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() })));
  };

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaTrigger
        render={
          <DropdownMenuItem
            closeOnClick={false}
            onSelect={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Bell />
            <span className="flex items-center gap-2">
              Notifications
              {unread > 0 && <Badge variant="default">{unread}</Badge>}
            </span>
          </DropdownMenuItem>
        }
      >
        <span className="sr-only">Notifications</span>
      </CredenzaTrigger>

      <CredenzaContent className="max-w-2xl">
        <CredenzaHeader>
          <CredenzaTitle>Notifications</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Button type="button" variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
              Mark all read
            </Button>
            <Link href="/inbox" className="text-sm text-muted-foreground hover:underline">
              Open inbox
            </Link>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">You have no notifications.</p>
          )}

          <div className="space-y-2">
            {items.map((n) => {
              const isUnread = !n.readAt;
              const Wrapper: any = n.href ? Link : "div";
              const wrapperProps = n.href ? { href: n.href } : {};
              return (
                <Wrapper
                  key={n.id}
                  {...wrapperProps}
                  className={`block rounded-lg border p-3 hover:bg-muted/30 ${isUnread ? "border-primary/40" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                    </div>
                    {isUnread && <Badge variant="default">New</Badge>}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
            Close
          </CredenzaClose>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
