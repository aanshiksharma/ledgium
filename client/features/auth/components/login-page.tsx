import Link from "next/link"

import {
  FieldGroup,
  Field,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field"

import { GoogleAuthButton, AuthForm } from "@/features/auth"

export function LoginPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 p-6 md:p-10">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </header>

      <div className="w-full max-w-xs">
        <AuthForm mode="login" />
      </div>

      <FieldGroup className="max-w-xs">
        <FieldSeparator>or</FieldSeparator>

        <Field>
          <GoogleAuthButton />

          <FieldDescription className="text-center">
            {`Don't have an account? `}
            <Link
              href="/register"
              className="underline-offset-4 hover:text-foreground!"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </section>
  )
}
