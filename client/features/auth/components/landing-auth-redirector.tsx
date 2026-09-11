"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/hooks/use-auth"

const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard"

export function LandingAuthRedirector() {
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE)
    }
  }, [status, router])

  return null
}
