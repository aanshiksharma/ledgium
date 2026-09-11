import { AuthForm } from "@/features/auth/components/auth-form"
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button"

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="w-full max-w-md space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Ledgium</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground">
            Start keeping your household finances clear.
          </p>
        </header>

        <GoogleAuthButton />

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <AuthForm mode="register" />
      </section>
    </main>
  )
}
