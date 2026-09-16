"use client"

import { Button } from "@/components/ui/button"
import { useHousehold } from "@/features/households"
import { useDebts } from "../hooks/use-debts"
import { DebtSummary } from "./debt-summary"
import { SettlementHistory } from "./settlement-history"

function localDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DebtsPage() {
  const { currentHousehold, isLoading: householdLoading } = useHousehold()
  const {
    balances,
    settlements,
    settlementTotal,
    isLoadingMoreSettlements,
    isLoading,
    isSubmitting,
    error,
    refresh,
    loadMoreSettlements,
    settle,
  } = useDebts(currentHousehold?.id ?? null)

  if (householdLoading) {
    return <p className="text-sm text-muted-foreground">Loading household...</p>
  }

  if (!currentHousehold) {
    return (
      <div className="rounded-2xl border p-6">
        <h2 className="font-semibold">No household selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select or create a household before managing debts and settlements.
        </p>
      </div>
    )
  }

  async function handleSettle(debtId: string, amount: number) {
    await settle(debtId, { amount, settledAt: localDate() })
  }

  const totalOutstanding = balances.reduce(
    (sum, balance) => sum + Number(balance.outstandingAmount),
    0,
  )

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Debts and Settlements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See who owes whom and keep a permanent record of settlements.
          </p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={isLoading || isSubmitting}>
          Refresh
        </Button>
      </header>

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
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: currentHousehold.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(totalOutstanding)}
            </p>
          </div>
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-muted-foreground">Debt relationships</p>
            <p className="mt-1 text-2xl font-semibold">{balances.length}</p>
          </div>
        </div>

        <DebtSummary
          balances={balances}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          onSettle={handleSettle}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Settlement history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every recorded payment remains here even after its debt is fully settled.
          </p>
        </div>
        <SettlementHistory
          settlements={settlements}
          total={settlementTotal}
          isLoading={isLoading}
          isLoadingMore={isLoadingMoreSettlements}
          onLoadMore={loadMoreSettlements}
        />
      </section>
    </section>
  )
}
