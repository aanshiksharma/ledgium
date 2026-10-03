"use client"

import { useEffect, useState } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemDescription,
  ItemTitle,
  ItemActions,
  ItemContent,
  ItemGroup,
} from "@/components/ui/item"

import { useAuth } from "@/features/auth"
import { SettleDebtButton, date, useDebts } from "@/features/debts"

import { money } from "@/lib/utils"

export function DebtSummary() {
  const { user } = useAuth()
  const { balances, isLoading } = useDebts()
  const [currentUserId, setCurrentUserId] = useState(user?.id)

  useEffect(() => {
    if (!user) return
    setCurrentUserId(user.id)
  }, [user])

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
          You are currently settled up for shared household expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {balances.map((balance) => {
        const canSettle = balance.creditor.id === currentUserId

        return (
          <Card key={`${balance.debtor.id}-${balance.creditor.id}`}>
            <CardHeader>
              <CardTitle>
                {balance.debtor.id === currentUserId
                  ? "You owe "
                  : `${balance.debtor.name} owes `}
                {balance.creditor.id === currentUserId
                  ? "you"
                  : balance.creditor.name}
              </CardTitle>

              <CardDescription>
                {balance.debts.length}{" "}
                {balance.debts.length === 1 ? "expense" : "expenses"}{" "}
                outstanding
              </CardDescription>

              <CardAction>
                {canSettle && <SettleDebtButton balance={balance} />}
              </CardAction>
            </CardHeader>

            <CardContent>
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

                <Item variant="muted">
                  <ItemContent>
                    <ItemTitle>Total</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    {money(balance.outstandingAmount, balance.currency)}
                  </ItemActions>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
