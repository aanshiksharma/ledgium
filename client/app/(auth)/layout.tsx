import { AuthPageGuard } from "@/features/auth/components/auth-page-guard"

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <AuthPageGuard>
      <main className="grid min-h-svh lg:grid-cols-2">
        {children}

        <section className="relative hidden bg-muted lg:grid">
          <div className="no-repeat h-full w-full bg-[url(https://images.unsplash.com/photo-1662152334753-6bc27d300fe6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D)] bg-cover bg-center" />

          <div className="absolute inset-0 bg-background opacity-40" />
        </section>
      </main>
    </AuthPageGuard>
  )
}
