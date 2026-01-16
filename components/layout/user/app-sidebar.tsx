import type * as React from "react";

import { AppSidebarClient } from "@/components/layout/user/app-sidebar-client";
import { getSidebarData } from "@/lib/sidebar";
import { Sidebar } from "@/components/ui/sidebar";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = await getSidebarData();

  return (
    <AppSidebarClient
      session={data.session}
      deviceSessions={data.deviceSessions}
      userRole={data.role}
      recentPools={data.recentPools}
      recentThreads={data.recentThreads}
      {...props}
    />
  );
}
