"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useAuth } from "@/features/auth"
import { HouseholdSelector } from "@/features/households"

export function AppHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    router.replace("/")
  }

  return (
    <header className="border-b bg-background">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 md:hidden">
          <span className="text-lg font-bold">Ledgium</span>
        </div>

        <div className="hidden md:block">
          <HouseholdSelector />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="truncate text-sm font-medium">
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleLogout()}
            aria-label="Log out"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <div className="border-t px-4 py-3 md:hidden">
        <HouseholdSelector />
      </div>
    </header>
  )
}
