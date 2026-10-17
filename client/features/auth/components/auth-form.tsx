"use client"

import { SubmitEvent, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useAuth } from "@/features/auth"

import { ApiError } from "@/lib/api/errors"

type Mode = "login" | "register"

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode === "register"

  const next = searchParams.get("next")

  const redirectPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/overview"

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      let response
      if (isRegister) response = await auth.register({ name, email, password })
      else response = await auth.login({ email, password })

      toast.success(`Signed in as ${response.user.name}`)
      router.replace(redirectPath)
    } catch (error) {
      setError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!error) return
    toast.error(error)
  }, [error])

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {isRegister && (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              value={name}
              minLength={2}
              maxLength={100}
              required
              autoComplete="name"
              placeholder="John Doe"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            required
            autoComplete="email"
            placeholder="john@gmail.com"
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            required
            minLength={isRegister ? 8 : 1}
            maxLength={128}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="Enter password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            {isRegister ? "Create account" : "Sign in"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
