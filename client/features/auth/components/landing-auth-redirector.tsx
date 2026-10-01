"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { AuthLoadingPage } from "@/components/common/auth-loading-page"

const DEFAULT_AUTHENTICATED_ROUTE = "/overview"

export function LandingAuthRedirector() {
  const router = useRouter()
  const { status } = useAuth()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE)
    }
  }, [status, router])

  if (status === "loading" || status === "authenticated")
    return <AuthLoadingPage />

  return null
}
