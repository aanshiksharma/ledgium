import { Household } from "@/features/households"
import { useHouseholdExpenses } from "@/features/household-expenses"

import {
  HouseholdExpenseListRow,
  HouseholdExpenseListRowSkeleton,
} from "./household-expense-list-row"
import { Table, TableBody } from "@/components/ui/table"

export function HouseholdExpenseList({
  viewMode,
  currentHousehold,
}: {
  viewMode: "grid" | "list"
  currentHousehold: Household
}) {
  const {
    expenses,
    isLoading: expensesLoading,
    isSubmitting,
  } = useHouseholdExpenses(currentHousehold.id)

  if (expensesLoading) {
    return (
      <Table>
        <TableBody>
          {Array.from(new Array(15)).map((_, index) => (
            <HouseholdExpenseListRowSkeleton key={index} />
          ))}
        </TableBody>
      </Table>
    )
  }

  if (!expenses.length) {
    return (
      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
          No shared expenses recorded yet.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-muted/25">
      <Table>
        <TableBody>
          {expenses.map((expense) => {
            const hasSettlements = expense.debts.some(
              (debt) => (debt._count?.settlementAllocations ?? 0) > 0
            )

            return (
              <HouseholdExpenseListRow
                key={expense.id}
                currentHousehold={currentHousehold}
                expense={expense}
                isSubmitting={isSubmitting}
              />
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
