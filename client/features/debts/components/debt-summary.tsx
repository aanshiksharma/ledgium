"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { DebtBalance } from "../types/debt.types"
import { SettlementDialog } from "./settlement-dialog"

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
  currentUserId: string | null
  isLoading: boolean
  isSubmitting: boolean
  onSettle: (input: {
    debtorId: string
    creditorId: string
    amount: number
    settledAt: string
    notes?: string
  }) => Promise<void>
}

export function DebtSummary({
  balances,
  currentUserId,
  isLoading,
  isSubmitting,
  onSettle,
}: Props) {
  const [selectedBalance, setSelectedBalance] = useState<DebtBalance | null>(
    null
  )

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground">
        Loading outstanding debts...
      </p>
    )
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
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {balances.map((balance) => {
          const canSettle =
            balance.debtor.id === currentUserId ||
            balance.creditor.id === currentUserId
          return (
            <article
              key={`${balance.debtor.id}-${balance.creditor.id}`}
              className="rounded-2xl border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {balance.debtor.name} owes {balance.creditor.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {balance.debts.length}{" "}
                    {balance.debts.length === 1 ? "expense" : "expenses"}{" "}
                    outstanding
                  </p>
                </div>
                <strong className="shrink-0 text-lg">
                  {money(balance.outstandingAmount, balance.currency)}
                </strong>
              </div>

              <div className="mt-5 space-y-2 border-t pt-4">
                {balance.debts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {debt.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date(debt.expenseDate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {money(debt.remainingAmount, balance.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {canSettle && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => setSelectedBalance(balance)}
                  >
                    Settle
                  </Button>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {selectedBalance && (
        <SettlementDialog
          balance={selectedBalance}
          currentUserId={currentUserId}
          isSubmitting={isSubmitting}
          onClose={() => setSelectedBalance(null)}
          onSubmit={async (input) => {
            await onSettle(input)
            setSelectedBalance(null)
          }}
        />
      )}
    </>
  )
}
