"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "../hooks/use-auth"

type AuthGuardProps = { children: React.ReactNode }

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useAuth()

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname)
      router.replace(`/login?next=${next}`)
    }
  }, [pathname, router, status])

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm">
        Loading...
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return children
}
