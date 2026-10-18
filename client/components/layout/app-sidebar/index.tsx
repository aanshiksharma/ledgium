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
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"

import { SidebarUser } from "./sidebar-user"
import { useAuth } from "@/features/auth"
import { useIsMobile } from "@/hooks/use-mobile"

export type SIDEBARUSER = {
  name: string
  email: string
  avatar: string | null
}

export function AppSidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { user, isLoading } = useAuth()
  const { toggleSidebar } = useSidebar()
  const [sidebarUser, setSidebarUser] = useState<SIDEBARUSER>({
    name: "test",
    email: "test",
    avatar: null,
  })

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
        <div className="flex items-center gap-2 p-2">
          <figure className="flex size-9 items-center justify-center rounded-md bg-primary/80 font-heading font-bold">
            L
          </figure>

          <span>Ledgium</span>
        </div>
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
                        <SidebarMenuButton
                          size={isMobile ? "lg" : "default"}
                          asChild
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                              "hover:bg-muted",
                              isActive && "bg-muted font-medium",
                              !item.enabled && "pointer-events-none opacity-30"
                            )}
                            onClick={() =>
                              isMobile ? toggleSidebar() : undefined
                            }
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
