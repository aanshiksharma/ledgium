"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/hooks/use-auth"

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
      router.replace("/dashboard")
    }
  }, [isCheckingAuth, status, router])

  if (isCheckingAuth || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  if (status === "authenticated") {
    return null
  }

  return children
}
