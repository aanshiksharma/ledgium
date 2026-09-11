"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { useAuth } from "@/features/auth"
import {
  CreateHouseholdForm,
  HouseholdSelector,
  useHousehold,
} from "@/features/households"

export default function Dashboard() {
  const { logout } = useAuth()
  const { isLoading, error, households, currentHousehold } = useHousehold()
  const router = useRouter()

  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {currentHousehold ? (
              <p className="text-sm text-muted-foreground">
                {currentHousehold.name} · {currentHousehold.currency}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <HouseholdSelector />
            <Button
              variant="outline"
              onClick={() => {
                logout()
                router.replace("/")
              }}
            >
              Logout
            </Button>
          </div>
        </header>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {!isLoading && households.length === 0 ? <CreateHouseholdForm /> : null}{" "}
        {currentHousehold ? (
          <section className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">{currentHousehold.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your current household is ready for the next application phases.
            </p>
          </section>
        ) : null}
      </section>
    </main>
  )
}
