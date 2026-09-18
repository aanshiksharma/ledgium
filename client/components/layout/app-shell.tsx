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

        <main className="p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
