import { LandingAuthRedirector } from "@/features/auth/components/landing-auth-redirector"

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LandingAuthRedirector />

      <section>
        <h1 className="text-4xl font-semibold">Ledgium</h1>
        <p className="mt-2 text-muted-foreground">
          Shared finances, kept clear.
        </p>
      </section>
    </main>
  )
}
