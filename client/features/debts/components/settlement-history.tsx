"use client"

import type { Settlement } from "../types/debt.types"

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
  settlements: Settlement[]
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  onLoadMore: () => Promise<void>
}

export function SettlementHistory({
  settlements,
  total,
  isLoading,
  isLoadingMore,
  onLoadMore,
}: Props) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading settlement history...</p>
  }

  if (!settlements.length) {
    return (
      <div className="rounded-2xl border p-6">
        <p className="font-medium">No settlements yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Payments recorded against household debts will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
        <span>Date</span>
        <span>From</span>
        <span>To</span>
        <span className="text-right">Amount</span>
      </div>

      <div className="divide-y">
        {settlements.map((settlement) => (
          <article key={settlement.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center md:gap-4">
            <div>
              <p className="text-sm font-medium">{date(settlement.settledAt)}</p>
              <p className="text-xs text-muted-foreground">
                {settlement.debt.householdExpense.description}
              </p>
            </div>
            <p className="text-sm">{settlement.debt.debtor.name}</p>
            <p className="text-sm">{settlement.debt.creditor.name}</p>
            <p className="text-sm font-semibold md:text-right">
              {money(settlement.amount, settlement.debt.currency)}
            </p>
          </article>
        ))}
      </div>
      {settlements.length < total && (
        <div className="border-t p-4 text-center">
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoadingMore}
            onClick={() => void onLoadMore()}
          >
            {isLoadingMore ? "Loading..." : `Load more (${total - settlements.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}
