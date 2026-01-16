"use client";

import { LayoutDashboard, LifeBuoy, Mail, MessageSquareText, Package, PackageSearch, Shield, Users2 } from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/layout/user/nav-main";
import { NavProjects } from "@/components/layout/user/nav-projects";
import { NavRecent } from "@/components/layout/user/nav-recent";
import { NavUser } from "@/components/layout/user/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import type { DeviceSession, Session } from "@/lib/auth-types";
import AccountSwitcher from "@/components/features/auth/account-switcher";

type Props = React.ComponentProps<typeof Sidebar> & {
  session: Session | null;
  deviceSessions: DeviceSession[];
  userRole: string | null;
  recentPools: { title: string; href: string; status: string }[];
  recentThreads: { title: string; href: string; subtitle: string | null }[];
};

export function AppSidebarClient({ session, deviceSessions, userRole, recentPools, recentThreads, ...props }: Props) {
  const navMain = buildNav(userRole);

  const extras = [
    { name: "Inbox", url: "/inbox", icon: Mail },
    { name: "Support", url: "/contact", icon: LifeBuoy },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />

        <NavRecent
          label="Recent pools"
          items={recentPools.map((p) => ({
            name: p.title,
            url: p.href,
            icon: Package,
            description: p.status,
          }))}
        />

        <NavRecent
          label="Recent messages"
          items={recentThreads.map((t) => ({
            name: t.title,
            url: t.href,
            icon: MessageSquareText,
            description: t.subtitle,
          }))}
        />

        <NavProjects projects={extras} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
        <AccountSwitcher
          deviceSessions={deviceSessions}
          initialSession={session}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function buildNav(role: string | null) {
  if (role === "admin") {
    return [
      { title: "Admin", url: "/admin", icon: Shield },
      { title: "Users", url: "/admin/users", icon: Users2 },
      { title: "Logs", url: "/admin/logs", icon: PackageSearch },
      { title: "Pools", url: "/pools", icon: Package },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ];
  }

  if (role === "supplier") {
    return [
      { title: "Supplier", url: "/supplier/dashboard", icon: PackageSearch },
      { title: "Pools", url: "/pools", icon: Package },
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ];
  }

  return [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pools", url: "/pools", icon: Package },
  ];
}
