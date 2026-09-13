"use client"

import type { ReactNode } from "react"

import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <div className="flex min-h-svh">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />

          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
