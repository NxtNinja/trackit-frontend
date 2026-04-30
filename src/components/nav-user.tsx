"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, SparklesIcon, CheckmarkBadgeIcon, CreditCardIcon, NotificationIcon, LogoutIcon } from "@hugeicons/core-free-icons"

import { apiProxy } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { User } from "@/types/api"
import Link from "next/link"

export function NavUser({
  user,
  isLoading,
}: {
  user?: User
  isLoading?: boolean
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const displayName = user?.name || "User"
  const displayEmail = user?.email || ""
  const displayAvatar = user?.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${displayName}`

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await apiProxy("/auth/logout", "POST")
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.message || "Failed to log out")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={displayAvatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">{displayEmail}</span>
                  </div>
                </>
              )}
              <HugeiconsIcon icon={UnfoldMoreIcon} strokeWidth={2} className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
<Link href={"/profile"}>
                <HugeiconsIcon icon={CheckmarkBadgeIcon} strokeWidth={2} />
                Account
</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
              <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

