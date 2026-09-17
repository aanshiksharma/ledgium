"use client"

import type { Debt } from "../types/debt.types"

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

type Props = { debts: Debt[]; isLoading: boolean }

export function SettledDebtList({ debts, isLoading }: Props) {
  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground">Loading settled debts...</p>
    )
  if (!debts.length)
    return (
      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">No settled debts found.</p>
      </div>
    )

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="hidden grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-xs font-medium tracking-wide text-muted-foreground uppercase md:grid">
        <span>Origin</span>
        <span>Debtor</span>
        <span>Creditor</span>
        <span className="text-right">Amount</span>
      </div>
      <div className="divide-y">
        {debts.map((debt) => (
          <article
            key={debt.id}
            className="grid gap-2 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center md:gap-4"
          >
            <div>
              <p className="text-sm font-medium">{debt.description}</p>
              <p className="text-xs text-muted-foreground">
                {date(debt.householdExpense?.expenseDate ?? debt.createdAt)}
              </p>
            </div>
            <p className="text-sm">{debt.debtor.name}</p>
            <p className="text-sm">{debt.creditor.name}</p>
            <p className="text-sm font-semibold md:text-right">
              {money(debt.amount, debt.currency)}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
