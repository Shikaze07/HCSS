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
    name: "Admin",
    email: "admin@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "User Management",
      url: "/admin/user-management",
      icon: IconChecklist,
    },
    {
      title: "Service Management",
      url: "/admin/service-management",
      icon: IconChecklist,
    },
    {
      title: "Worker Assignment",
      url: "/admin/worker-assignment",
      icon: IconChecklist,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconGavel,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState(data.user)
  const [navItems, setNavItems] = React.useState(data.navMain)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const json = await res.json()
        if (res.ok && json.user) {
          const u = json.user
          setUser({
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            avatar: "/avatars/shadcn.jpg",
          })

          // Custom nav items based on role
          if (u.role === "CLIENT") {
            setNavItems([
              {
                title: "Booking Management",
                url: "/client/booking-management",
                icon: IconChecklist,
              },
              {
                title: "Service Tracking",
                url: "/client/service-tracking",
                icon: IconListDetails,
              },
            ])
          } else if (u.role === "ADMIN") {
            setNavItems(data.navMain)
          } else if (u.role === "WORKER") {
            setNavItems([
              {
                title: "Dashboard",
                url: "/worker/dashboard",
                icon: IconDashboard,
              }
            ])
          }
        }
      } catch (error) {
        console.error("Failed to fetch user for sidebar:", error)
      }
    }
    fetchUser()
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-md text-sm font-semibold">
                {/* <Image src="/ched-logo.png" alt="CHED Logo" width={50} height={50} /> */}
                <h1 className=" text-2xl">LOGO</h1>
              </div>

              <div className="leading-tight">
                <h1 className="text-sm font-medium">
                  Home Cleaning Service System
                </h1>

              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
