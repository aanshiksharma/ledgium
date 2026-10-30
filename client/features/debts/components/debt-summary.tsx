import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { DebtCard, DebtCardSkeleton, useDebts } from "@/features/debts"
import { useAuth } from "@/features/auth"

export function DebtSummary() {
  const { user } = useAuth()
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
    <Tabs defaultValue="owe">
      <TabsList>
        <TabsTrigger value="owe">You owe</TabsTrigger>
        <TabsTrigger value="owed">You are owed</TabsTrigger>
      </TabsList>

      <TabsContent value="owe">
        <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {balances
            .filter((balance) => balance.debtor.id === user?.id)
            .map((balance) => (
              <DebtCard
                key={`${balance.creditor.id}-${balance.debtor.id}`}
                balance={balance}
              />
            ))}
        </section>
      </TabsContent>

      <TabsContent value="owed">
        <section className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {balances
            .filter((balance) => balance.creditor.id === user?.id)
            .map((balance) => (
              <DebtCard
                key={`${balance.creditor.id}-${balance.debtor.id}`}
                balance={balance}
              />
            ))}
        </section>
      </TabsContent>
    </Tabs>
  )
}
