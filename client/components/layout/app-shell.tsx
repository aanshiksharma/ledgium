import type { ReactNode } from "react"

import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <main className="flex h-full flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
