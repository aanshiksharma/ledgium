import { AppShell } from "@/components/layout/app-shell"
import { AuthGuard } from "@/features/auth/components/auth-guard"

type ProtectedLayoutProps = {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}
