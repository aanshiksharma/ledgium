import { Button } from "@/components/ui/button"

import { LandingAuthRedirector } from "@/features/auth/components/landing-auth-redirector"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LandingAuthRedirector />

      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold">Ledgium</h1>
        <p className="text-muted-foreground">Shared finances, kept clear.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
