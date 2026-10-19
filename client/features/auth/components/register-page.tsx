import Link from "next/link"

import {
  FieldGroup,
  Field,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field"

import { GoogleAuthButton, AuthForm } from "@/features/auth"

export function RegisterPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 p-6 md:p-10">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground">
          Start keeping your household finances clear.
        </p>
      </header>

      <div className="w-full max-w-xs">
        <AuthForm mode="register" />
      </div>

      <FieldGroup className="max-w-xs">
        <FieldSeparator>or</FieldSeparator>

        <Field>
          <GoogleAuthButton />

          <FieldDescription className="text-center">
            {`Already have an account? `}
            <Link
              href="/login"
              className="underline-offset-4 hover:text-foreground!"
            >
              Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </section>
  )
}
