"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Debt } from "../types/debt.types"

function money(v: string, c: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
  }).format(Number(v))
}

type Props = {
  debts: Debt[]
  isLoading: boolean
  isSubmitting: boolean
  onSettle: (id: string, amount: number) => Promise<void>
}

export function DebtList({ debts, isLoading, isSubmitting, onSettle }: Props) {
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading debts...</p>

  if (!debts.length)
    return (
      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
          No outstanding household debts.
        </p>
      </div>
    )

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <article key={debt.id} className="rounded-2xl border p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold">
                {debt.debtor.name} owes {debt.creditor.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {debt.description}
              </p>
            </div>
            <strong>{money(debt.amount, debt.currency)}</strong>
          </div>
          {debt.status !== "SETTLED" && debt.status !== "CANCELLED" && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amounts[debt.id] ?? debt.amount}
                onChange={(e) =>
                  setAmounts((current) => ({
                    ...current,
                    [debt.id]: e.target.value,
                  }))
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              />
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={() =>
                  void onSettle(
                    debt.id,
                    Number(amounts[debt.id] ?? debt.amount)
                  )
                }
              >
                Record settlement
              </Button>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}
