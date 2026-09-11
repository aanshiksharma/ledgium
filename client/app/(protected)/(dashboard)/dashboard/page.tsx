"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { useAuth } from "@/features/auth/hooks/use-auth"

export default function Dashboard() {
  const { logout } = useAuth()
  const router = useRouter()

  return (
    <main>
      <section className="flex h-screen flex-col items-center justify-center gap-5">
        <h1>Dashboard</h1>
        <Button
          onClick={() => {
            logout()
            router.replace("/")
          }}
        >
          Logout
        </Button>
      </section>
    </main>
  )
}
