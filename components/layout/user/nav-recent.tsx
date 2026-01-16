"use client";

import Link from "next/link";
import { MessageSquareText, PackageSearch, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type NavRecentItem = {
  name: string;
  url: string;
  icon: LucideIcon;
  description?: string | null;
};

export function NavRecent({
  label,
  items,
}: {
  label: string;
  items: NavRecentItem[];
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              {label.toLowerCase().includes("message") ? (
                <MessageSquareText className="text-sidebar-foreground/70" />
              ) : (
                <PackageSearch className="text-sidebar-foreground/70" />
              )}
              <span className="truncate">Nothing yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton render={<Link href={item.url} />}>
                <item.icon />
                <span className="truncate">{item.name}</span>
                {item.description ? (
                  <span className="ml-auto truncate text-xs text-sidebar-foreground/60 max-w-28">{item.description}</span>
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
