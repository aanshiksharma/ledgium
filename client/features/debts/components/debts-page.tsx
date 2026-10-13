"use client"

import { SlidersHorizontal, RefreshCcw } from "lucide-react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  LoadingHousehold,
  NoCurrentHousehold,
  useHousehold,
} from "@/features/households"

import { useDebts, DebtSummary } from "@/features/debts"

export function DebtsPage() {
  const {
    households,
    currentHousehold,
    isLoading: householdLoading,
  } = useHousehold()
  const { isLoading, isSubmitting, error, refresh } = useDebts()

  if (householdLoading) return <LoadingHousehold />

  if (!currentHousehold) {
    return <NoCurrentHousehold households={households} />
  }

  return (
    <>
      <section className="flex flex-col gap-4 lg:gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage Debts
          </h1>
        </header>

        <div className="flex items-center gap-2">
          <Field className="flex-1">
            <Input placeholder="Search debts..." />
          </Field>

          <Button variant="outline" size="icon">
            <SlidersHorizontal />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => void refresh()}
            disabled={isLoading || isSubmitting}
          >
            <RefreshCcw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <DebtSummary />
    </>
  )
}
