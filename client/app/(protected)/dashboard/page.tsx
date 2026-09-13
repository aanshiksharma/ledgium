"use client"

import { CreateHouseholdForm, useHousehold } from "@/features/households"

export default function Dashboard() {
  const { isLoading, error, households, currentHousehold } = useHousehold()

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {currentHousehold ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {currentHousehold.name} · {currentHousehold.currency}
          </p>
        ) : null}
      </header>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!isLoading && households.length === 0 ? <CreateHouseholdForm /> : null}

      {currentHousehold ? (
        <section className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{currentHousehold.name}</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your current household is ready for the next application phases.
          </p>
        </section>
      ) : null}
    </section>
  )
}
