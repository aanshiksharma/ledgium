import { AuthPageGuard } from "@/features/auth/components/auth-page-guard"

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthPageGuard>{children}</AuthPageGuard>
}
