"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Layout01Icon, 
  TransactionIcon, 
  Analytics01Icon, 
  Wallet01Icon, 
  Calendar01Icon, 
  TagsIcon, 
  Settings05Icon, 
  ChartRingIcon, 
  SentIcon, 
  Leaf01Icon 
} from "@hugeicons/core-free-icons"

import { apiProxy } from "@/lib/api"

// ... (keep the rest of the imports)

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <HugeiconsIcon icon={Layout01Icon} strokeWidth={2} />
      ),
      isActive: true,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: (
        <HugeiconsIcon icon={TransactionIcon} strokeWidth={2} />
      ),
      items: [
        {
          title: "All Transactions",
          url: "/transactions",
        },
        {
          title: "Income",
          url: "/transactions/income",
        },
        {
          title: "Expenses",
          url: "/transactions/expenses",
        },
      ],
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: (
        <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} />
      ),
      items: [
        {
          title: "Budget Planning",
          url: "/budgets/planning",
        },
        {
          title: "Savings Goals",
          url: "/budgets/goals",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: (
        <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
      ),
      items: [
        {
          title: "Spending Reports",
          url: "/analytics/spending",
        },
        {
          title: "Income Reports",
          url: "/analytics/income",
        },
        {
          title: "Monthly Summary",
          url: "/analytics/summary",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Support",
      url: "#",
      icon: (
        <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Feedback",
      url: "#",
      icon: (
        <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
      ),
    },
  ],
  projects: [
    {
      name: "Recurring Bills",
      url: "/recurring",
      icon: (
        <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
      ),
    },
    {
      name: "Categories",
      url: "/categories",
      icon: (
        <HugeiconsIcon icon={TagsIcon} strokeWidth={2} />
      ),
    },
  ],
}

import { useQuery } from "@tanstack/react-query"
import { User } from "@/types/api"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await apiProxy<User>("/auth/me", "GET")
      return response.data
    },
    retry: false // Don't retry if auth fails
  })

  const user = {
    name: userData?.name || "User",
    email: userData?.email || "",
    avatar: userData?.avatar || "/avatars/user.jpg",
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HugeiconsIcon icon={Leaf01Icon} strokeWidth={2} className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Trackit</span>
                  <span className="truncate text-xs text-muted-foreground">Expense Tracker</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} isLoading={isUserLoading} />
      </SidebarFooter>
    </Sidebar>
  )
}

