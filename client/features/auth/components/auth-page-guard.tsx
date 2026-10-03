"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/hooks/use-auth"
import { AuthLoadingPage } from "@/components/common/auth-loading-page"

type AuthPageGuardProps = {
  children: React.ReactNode
}

export function AuthPageGuard({ children }: AuthPageGuardProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { status, refresh } = useAuth()

  useEffect(() => {
    let mounted = true

    const checkAuthentication = async () => {
      setIsCheckingAuth(true)

      try {
        await refresh()
      } finally {
        if (mounted) setIsCheckingAuth(false)
      }
    }

    void checkAuthentication()

    return () => {
      mounted = false
    }
  }, [refresh])

  useEffect(() => {
    if (!isCheckingAuth && status === "authenticated") {
      router.replace("/overview")
    }
  }, [isCheckingAuth, status, router])

  if (isCheckingAuth || status === "loading") {
    return <AuthLoadingPage />
  }

  if (status === "authenticated") {
    return null
  }

  return children
}
