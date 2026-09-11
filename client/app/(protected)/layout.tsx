import { AuthGuard } from "@/features/auth/components/auth-guard"

type ProtectedLayoutProps = {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <AuthGuard>{children}</AuthGuard>
}
