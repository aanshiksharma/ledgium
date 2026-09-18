"use client"

import { usePathname } from "next/navigation"

import { Sidebar } from "lucide-react"

import { Button } from "../ui/button"
import { useSidebar } from "../ui/sidebar"

export function AppHeader() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  const currentView = pathname.split("/")[1]
  const label = currentView.split("-").join(" ")

  return (
    <header className="sticky top-0 z-50 grid grid-cols-3 items-center justify-items-center border-b bg-background p-2 text-sm">
      <div className="justify-self-start">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Sidebar />
        </Button>
      </div>

      <p className="capitalize">{label}</p>

      <div className="justify-self-end"></div>
    </header>
  )
}
