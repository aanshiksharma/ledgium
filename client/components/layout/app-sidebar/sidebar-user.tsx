import { useRouter } from "next/navigation"

import { Ellipsis, LogOut } from "lucide-react"

import { ApiError } from "@/lib/api/errors"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

import { useAuth } from "@/features/auth"

import type { SIDEBARUSER } from "./index.tsx"
import { toast } from "sonner"

export function SidebarUser({ user }: { user: SIDEBARUSER }) {
  const { logout } = useAuth()
  const { isMobile } = useSidebar()
  const router = useRouter()

  async function handleLogout() {
    toast.promise<void>(
      async () => {
        await logout()
      },
      {
        loading: "Logging out",
        success: () => {
          router.replace("/")
          return "Logged out successfully"
        },
        error: (error) =>
          error instanceof ApiError
            ? error.message
            : "Could not log you out. Please try again",
      }
    )
  }

  if (!user)
    return <div className="p-4 text-sm text-muted-foreground">Error</div>

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.split(" ").map((word) => word.charAt(0))}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <Ellipsis className="ml-auto size-4" />
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
                  <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.split(" ").map((word) => word.charAt(0))}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                void handleLogout()
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
