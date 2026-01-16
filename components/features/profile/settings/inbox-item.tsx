"use client";

import { useEffect, useState } from "react";
import { LuInbox } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function InboxItem() {
  const router = useRouter();
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const json = (await res.json()) as { unreadCount?: number };
        if (active) setUnread(json.unreadCount || 0);
      } catch {
        // ignore
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DropdownMenuItem
      onSelect={() => {
        router.push("/inbox");
      }}
    >
      <LuInbox />
      <span className="flex items-center gap-2">
        Inbox
        {unread > 0 && <Badge variant="default">{unread}</Badge>}
      </span>
    </DropdownMenuItem>
  );
}
