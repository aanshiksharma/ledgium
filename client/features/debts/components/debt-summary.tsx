import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

import { DebtCard, DebtCardSkeleton, useDebts } from "@/features/debts"

export function DebtSummary() {
  const { balances, isLoading } = useDebts()

  if (isLoading)
    return (
      <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {Array.from(new Array(5)).map((_, index) => (
          <DebtCardSkeleton key={index} />
        ))}
      </section>
    )

  if (!balances.length) {
    return (
      <Empty className="min-h-[40vh]">
        <EmptyHeader>
          <EmptyTitle>No outstanding debts</EmptyTitle>
          <EmptyDescription>
            You are currently settled up for shared household expenses.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      {balances.map((balance) => (
        <DebtCard
          key={`${balance.creditor.id}-${balance.debtor.id}`}
          balance={balance}
        />
      ))}
    </section>
  )
}
