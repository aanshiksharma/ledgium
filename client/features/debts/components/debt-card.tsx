"use client"

import { useEffect, useState } from "react"

import { money, date } from "@/lib/utils"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item"
import { SettleDebtButton, DebtBalance } from "@/features/debts"

import { useAuth } from "@/features/auth"
import { Skeleton } from "@/components/ui/skeleton"

export function DebtCard({ balance }: { balance: DebtBalance }) {
  const { user } = useAuth()
  const [currentUserId, setCurrentUserId] = useState(user?.id)

  useEffect(() => {
    if (!user) return
    setCurrentUserId(user.id)
  }, [user])

  const canSettle = balance.creditor.id === currentUserId

  return (
    <Card key={`${balance.debtor.id}-${balance.creditor.id}`}>
      <CardHeader>
        <CardTitle>
          {balance.debtor.id === user!.id
            ? "You owe "
            : `${balance.debtor.name} owes `}
          {balance.creditor.id === user!.id ? "you" : balance.creditor.name}
        </CardTitle>

        <CardDescription>
          {balance.debts.length}{" "}
          {balance.debts.length === 1 ? "expense" : "expenses"} outstanding
        </CardDescription>

        <CardAction>
          <p className="text-xl">
            {money(balance.outstandingAmount, balance.currency)}
          </p>
        </CardAction>
      </CardHeader>

      <CardContent className="h-full">
        <div className="flex h-full flex-col justify-between gap-2">
          <ItemGroup>
            {balance.debts.map((debt) => (
              <Item key={debt.id} size="sm" variant="muted">
                <ItemContent>
                  <ItemTitle>{debt.description}</ItemTitle>
                  <ItemDescription className="text-xs">
                    {date(debt.expenseDate)}
                  </ItemDescription>
                </ItemContent>

                <ItemActions>
                  <span className="shrink-0 text-sm font-medium">
                    {money(debt.remainingAmount, balance.currency)}
                  </span>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>

          {canSettle && <SettleDebtButton balance={balance} />}
        </div>
      </CardContent>
    </Card>
  )
}

export function DebtCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-3 w-26" />

        <CardAction>
          <Skeleton className="h-8 w-18" />
        </CardAction>
      </CardHeader>

      <CardContent className="h-full">
        <div className="flex h-full flex-col justify-between gap-2">
          <ItemGroup>
            {Array.from(new Array(1 + Math.floor(Math.random() * 3))).map(
              (_, index) => (
                <Item key={index} size="sm" variant="muted">
                  <ItemContent>
                    <Skeleton className="h-4 w-30" />
                    <Skeleton className="h-3 w-12" />
                  </ItemContent>

                  <ItemActions>
                    <Skeleton className="h-4 w-23" />
                  </ItemActions>
                </Item>
              )
            )}
          </ItemGroup>
        </div>
      </CardContent>
    </Card>
  )
}
