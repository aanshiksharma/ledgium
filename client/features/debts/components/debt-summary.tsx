"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { DebtBalance } from "../types/debt.types"

function money(value: string, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function date(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

type Props = {
  balances: DebtBalance[]
  isLoading: boolean
  isSubmitting: boolean
  onSettle: (debtId: string, amount: number) => Promise<void>
}

export function DebtSummary({ balances, isLoading, isSubmitting, onSettle }: Props) {
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading outstanding debts...</p>
  }

  if (!balances.length) {
    return (
      <div className="rounded-2xl border p-6">
        <p className="font-medium">No outstanding debts</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone is currently settled up for shared household expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {balances.map((balance) => (
        <article key={`${balance.debtor.id}-${balance.creditor.id}`} className="rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">
                {balance.debtor.name} owes {balance.creditor.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {balance.debts.length} {balance.debts.length === 1 ? "expense" : "expenses"} outstanding
              </p>
            </div>
            <strong className="shrink-0 text-lg">
              {money(balance.outstandingAmount, balance.currency)}
            </strong>
          </div>

          <div className="mt-5 space-y-3 border-t pt-4">
            {balance.debts.map((debt) => (
              <div key={debt.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{debt.description}</p>
                    <p className="text-xs text-muted-foreground">{date(debt.expenseDate)}</p>
                  </div>
                  <span className="font-medium">{money(debt.remainingAmount, balance.currency)}</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    min="0.01"
                    max={debt.remainingAmount}
                    step="0.01"
                    value={amounts[debt.id] ?? debt.remainingAmount}
                    onChange={(event) =>
                      setAmounts((current) => ({ ...current, [debt.id]: event.target.value }))
                    }
                    className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
                    aria-label={`Settlement amount for ${debt.description}`}
                  />
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      const amount = Number(amounts[debt.id] ?? debt.remainingAmount)
                      if (Number.isFinite(amount) && amount > 0) void onSettle(debt.id, amount)
                    }}
                  >
                    Settle
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
