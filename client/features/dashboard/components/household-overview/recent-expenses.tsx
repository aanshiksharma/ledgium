import Link from "next/link"

import { Book } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Table, TableBody } from "@/components/ui/table"

import {
  useHouseholdExpenses,
  HouseholdExpenseListRow,
  HouseholdExpenseListRowSkeleton,
} from "@/features/household-expenses"
import { Household } from "@/features/households"

type Props = {
  currentHousehold: Household
}

export function RecentExpenses({ currentHousehold }: Props) {
  const {
    isLoading: expensesLoading,
    isSubmitting: expenseSubmitting,
    expenses,
  } = useHouseholdExpenses(currentHousehold.id)

  return (
    <section className="flex flex-col gap-4 lg:gap-6">
      <header className="flex items-center justify-between px-1 pt-4">
        <h2 className="text-xl">Recent Expenses</h2>

        <Link href="/expenses" className="text-xs hover:underline">
          See All
        </Link>
      </header>

      <section className="overflow-hidden rounded-xl bg-muted/25">
        {expensesLoading ? (
          <Table>
            <TableBody>
              {Array.from(new Array(10)).map((_, index) => (
                <HouseholdExpenseListRowSkeleton key={index} />
              ))}
            </TableBody>
          </Table>
        ) : expenses.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <Book />
              </EmptyMedia>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>
                Your household does not have any expenses yet. Add an expense
                and start managing your expenses.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableBody>
              {expenses
                .filter((_, index) => index < 10)
                .map((expense) => (
                  <HouseholdExpenseListRow
                    currentHousehold={currentHousehold}
                    isSubmitting={expenseSubmitting}
                    key={expense.id}
                    expense={expense}
                    hideDelete
                  />
                ))}
            </TableBody>
          </Table>
        )}
      </section>
    </section>
  )
}
