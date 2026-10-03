"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "../hooks/use-auth"
import { AuthLoadingPage } from "@/components/common/auth-loading-page"

type AuthGuardProps = { children: React.ReactNode }

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useAuth()

  const [showLoadingOverlay, setShowLoadingOverlay] = useState<boolean>(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname)
      router.replace(`/login?next=${next}`)
    }
  }, [pathname, router, status])

  if (status === "loading") {
    return <AuthLoadingPage isExiting={false} />
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <>
      {children}
      {showLoadingOverlay && (
        <AuthLoadingPage
          isExiting={true}
          onAnimationComplete={() => setShowLoadingOverlay(false)}
        />
      )}
    </>
  )
}
