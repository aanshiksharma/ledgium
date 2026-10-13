"use client"

import { useDebts } from "@/features/debts"
import { SettlementCard, SettlementCardSkeleton } from "./settlement-card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export function SettlementHistory() {
  const {
    settlements,
    settlementTotal,
    isLoading,
    isLoadingMoreSettlements,
    loadMoreSettlements,
  } = useDebts()

  if (isLoading)
    return (
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from(new Array(18)).map((_, index) => (
          <SettlementCardSkeleton key={index} />
        ))}
      </div>
    )

  if (!settlements.length)
    return (
      <Empty className="min-h-[50vh]">
        <EmptyHeader>
          <EmptyTitle>No Settlements Yet</EmptyTitle>
          <EmptyDescription>
            {`There has not been a settlement yet.
            Settlements will appear here once a debt has been settled.`}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <section>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {settlements.map((settlement) => (
          <SettlementCard key={settlement.id} settlement={settlement} />
        ))}
      </div>

      {settlements.length < settlementTotal && (
        <div className="border-t p-4 text-center">
          <button
            type="button"
            className="text-sm font-medium underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoadingMoreSettlements}
            onClick={() => void loadMoreSettlements()}
          >
            {isLoadingMoreSettlements
              ? "Loading..."
              : `Load more (${settlementTotal - settlements.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  )
}
