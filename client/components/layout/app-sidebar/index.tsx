"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { navigationGroups } from "@/features/navigation/navigation.config"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar"
import { HouseholdSwitcher } from "./household-switcher"
import { SidebarUser } from "./sidebar-user"
import { useAuth } from "@/features/auth"

export type SIDEBARUSER = {
  name: string
  email: string
  avatar: string | null
}

export function AppSidebar() {
  const pathname = usePathname()
  const [sidebarUser, setSidebarUser] = useState<SIDEBARUSER>({
    name: "test",
    email: "test",
    avatar: null,
  })
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!user) return

    const serializedUser = {
      name: user.name,
      email: user.email,
      avatar: user.imageUrl,
    }

    setSidebarUser(serializedUser)
  }, [user, isLoading])

  return (
    <Sidebar>
      <SidebarHeader>
        <HouseholdSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <nav>
          {navigationGroups.map((group, index) => (
            <SidebarGroup key={index}>
              {group.title && (
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.enabled &&
                      (pathname === item.href ||
                        pathname.startsWith(`${item.href}/`))

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                              "hover:bg-muted",
                              isActive && "bg-muted font-medium",
                              !item.enabled && "pointer-events-none opacity-30"
                            )}
                          >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
