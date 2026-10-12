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
import { useAuth } from "@/features/auth"
import { money } from "@/lib/utils"

export function DebtsPage() {
  const {
    households,
    currentHousehold,
    isLoading: householdLoading,
  } = useHousehold()
  const { user } = useAuth()

  const { balances, isLoading, isSubmitting, error, refresh } = useDebts()

  if (householdLoading) return <LoadingHousehold />

  if (!currentHousehold) {
    return <NoCurrentHousehold households={households} />
  }

  const totalOutstanding = !user
    ? 0
    : balances.reduce(
        (sum, balance) =>
          sum + balance.debtor.id === user.id
            ? Number(balance.outstandingAmount)
            : 0,
        0
      )

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

      <section className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Outstanding debt</p>
            <p className="mt-1 text-2xl font-semibold">
              {money(totalOutstanding, currentHousehold.currency)}
            </p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Debt relationships</p>
            <p className="mt-1 text-2xl font-semibold">{balances.length}</p>
          </div>
        </div>

        <DebtSummary />
      </section>
    </>
  )
}
