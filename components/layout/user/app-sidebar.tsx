"use client"

import { useSession } from "@/lib/auth-client"
import type * as React from "react"
import {
  LuAudioWaveform as AudioWaveform,
  LuBookOpen as BookOpen,
  LuBot as Bot,
  LuCommand as Command,
  LuCommand as CommandIcon,
  LuFileUser as FileUserIcon,
  LuFrame as Frame,
  LuGalleryVerticalEnd as GalleryVerticalEnd,
  LuMap as Map,
  LuPersonStanding as PersonStanding,
  LuScanSearch as ScanSearch,
  LuWrench as Wrench
} from "react-icons/lu"

import { NavMain } from "@/components/layout/user/nav-main"
import { NavProjects } from "@/components/layout/user/nav-projects"
import { NavUser } from "@/components/layout/user/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "You",
    email: "@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "One",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Two",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Three",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: CommandIcon,
    },
    {
      title: "Exercises",
      url: "/event",
      icon: PersonStanding,
    },
    {
      title: "Symptom Search",
      url: "/support",
      icon: Bot,
    },
    {
      title: "Medicine Finder",
      url: "/faqs",
      icon: BookOpen,
    },
  ],
  projects: [
    {
      name: "Glossary & FAQs",
      url: "/faqs",
      icon: Map,
    },
    {
      name: "Contact Support",
      url: "/support",
      icon: Wrench,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
