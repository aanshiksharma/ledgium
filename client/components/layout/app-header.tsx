"use client"

import { usePathname } from "next/navigation"

import { Plus, Sidebar } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

import { HouseholdSwitcher } from "@/components/layout/household-switcher"

import { ExpenseFormButton } from "@/features/expenses"

import { useIsMobile } from "@/hooks/use-mobile"

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const isMobile = useIsMobile()

  const currentView = pathname.split("/")[1]
  const label = currentView.split("-").join(" ")

  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 items-center justify-items-center border-b bg-background px-2 py-3 text-sm">
      <div className={`flex items-center gap-2 justify-self-start`}>
        <Button
          variant="ghost"
          size={isMobile ? "icon-lg" : "icon"}
          onClick={toggleSidebar}
        >
          <Sidebar />
        </Button>

        <HouseholdSwitcher className={isMobile ? "hidden" : undefined} />
      </div>

      <HouseholdSwitcher className={!isMobile ? "hidden" : undefined} />

      <h1 className={`capitalize ${isMobile ? "hidden" : undefined}`}>
        {label}
      </h1>

      <div className="flex items-center gap-2 justify-self-end">
        <ExpenseFormButton>
          <Button variant="ghost" size={isMobile ? "icon-lg" : "default"}>
            <Plus />
            {!isMobile ? "Add Expense" : undefined}
          </Button>
        </ExpenseFormButton>
        {/* future plan to put logo here */}
      </div>
    </header>
  )
}
