"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "../hooks/use-auth"
import { ApiError } from "@/lib/api/errors"

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export function GoogleAuthButton() {
  const router = useRouter()
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      const container = document.getElementById("google-sign-in")
      if (!container || !window.google) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          setError(null)
          setLoading(true)

          try {
            await auth.loginWithGoogle({ credential })
            router.replace("/")
          } catch (error) {
            setError(
              error instanceof ApiError
                ? error.message
                : "Google authentication failed."
            )
          } finally {
            setLoading(false)
          }
        },
      })

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
      })
    }

    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [auth, router])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        Google authentication is not configured
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div
        id="google-sign-in"
        className={loading ? "pointer-events-none opacity-50" : undefined}
      />
      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
