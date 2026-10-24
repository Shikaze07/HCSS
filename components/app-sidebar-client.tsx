"use client"

import * as React from "react"
import {
  IconBook2,
  IconCamera,
  IconChartBar,
  IconChecklist,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconGavel,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Image from "next/image"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Client",
    email: "client@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/client/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Booking Management",
      url: "/client/booking-management",
      icon: IconChecklist,
    },
    {
      title: "Service Tracking",
      url: "/client/service-tracking",
      icon: IconGavel,
    },
    {
      title: "Service History",
      url: "/client/service-history",
      icon: IconChecklist,
    },


  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebarClient({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-200/60 p-1 shadow-sm">
                <Image src="/logohcss.png" alt="HCSS Logo" width={36} height={36} className="object-contain" priority />
              </div>

              <div className="leading-tight">
                <h1 className="text-sm font-bold text-foreground">
                  HCSS Client
                </h1>
                <p className="text-[11px] text-muted-foreground">Home Cleaning System</p>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
