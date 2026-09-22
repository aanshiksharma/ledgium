import Link from "next/link"

import { BadgeCheck } from "lucide-react"

import { money, cn } from "@/lib/utils"

import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Item, ItemHeader, ItemTitle, ItemContent } from "@/components/ui/item"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"

import { useAuth } from "@/features/auth"
import { useDebts } from "@/features/debts"
import { Dashboard, useDashboard } from "@/features/dashboard"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  currentHouseholdId: string
}

export function DebtsOverview({ currentHouseholdId }: Props) {
  const { user } = useAuth()
  const { isLoading: balanceLoading, balances } = useDebts(currentHouseholdId)
  const { isLoading: dashboardLoading, dashboard } =
    useDashboard(currentHouseholdId)

  const [householdDebts, setHouseholdDebts] = useState<
    Dashboard["householdDebts"] | undefined
  >(dashboard?.householdDebts)

  useEffect(() => {
    setHouseholdDebts(dashboard?.householdDebts)
  }, [dashboard])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Debts</CardTitle>

        <CardAction>
          <Link
            href="/debts-and-settlements"
            className="text-xs hover:underline"
          >
            See All
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-wrap gap-4">
            <Item variant="muted" className="flex-1 basis-35">
              <ItemHeader>
                <ItemTitle>You owe</ItemTitle>
              </ItemHeader>

              <ItemContent>
                {!dashboard || dashboardLoading || !householdDebts ? (
                  <Skeleton className="h-8 w-40 rounded-xl" />
                ) : (
                  <p className="text-2xl font-semibold tracking-tight text-loss">
                    {money(householdDebts.amountOwed, householdDebts?.currency)}
                  </p>
                )}
              </ItemContent>
            </Item>

            <Item variant="muted" className="flex-1 basis-35">
              <ItemHeader>
                <ItemTitle>You are owed</ItemTitle>
              </ItemHeader>

              <ItemContent>
                {!dashboard || dashboardLoading || !householdDebts ? (
                  <Skeleton className="h-8 w-40 rounded-xl" />
                ) : (
                  <p className="text-2xl font-semibold tracking-tight text-profit">
                    {money(
                      householdDebts.amountReceivable,
                      householdDebts.currency
                    )}
                  </p>
                )}
              </ItemContent>
            </Item>

            <Item variant="muted" className="flex-1 basis-35">
              <ItemHeader>
                <ItemTitle>Net Sum</ItemTitle>
              </ItemHeader>

              <ItemContent>
                {!dashboard || dashboardLoading || !householdDebts ? (
                  <Skeleton className="h-8 w-40 rounded-xl" />
                ) : (
                  <p
                    className={cn(
                      "text-2xl font-semibold tracking-tight",
                      Number(householdDebts.amountOwed) -
                        Number(householdDebts.amountReceivable) >
                        0
                        ? "text-loss"
                        : "text-profit"
                    )}
                  >
                    {money(
                      Math.abs(
                        Number(householdDebts.amountOwed) -
                          Number(householdDebts.amountReceivable)
                      ),
                      householdDebts.currency
                    )}
                  </p>
                )}
              </ItemContent>
            </Item>
          </div>

          {!balances || balanceLoading ? (
            <div className="overflow-hidden rounded-xl">
              <Table>
                <TableBody>
                  {Array.from(new Array(4)).map((_, index) => {
                    return (
                      <TableRow key={index} className="border-none">
                        <TableCell>
                          <Skeleton className="h-4 w-40 rounded-xl" />
                        </TableCell>
                        <TableCell align="right">
                          <Skeleton className="h-4 w-20 rounded-xl" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : balances.filter((balance) => balance.debtor.id === user?.id)
              .length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <BadgeCheck />
                </EmptyMedia>
                <EmptyTitle>You&apos;re all cleared up</EmptyTitle>
                <EmptyDescription>
                  There are no outstanding debts. You&apos;ll see debts when a
                  member in your household adds an expense.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-xl">
              <Table>
                <TableBody>
                  {balances
                    .filter((balance) => balance.debtor.id === user?.id)
                    .filter((_, index) => index < 6)
                    .map((balance, index) => {
                      return (
                        <TableRow key={index} className="border-none">
                          <TableCell>{balance.creditor.name}</TableCell>
                          <TableCell align="right">
                            {money(balance.outstandingAmount, balance.currency)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
