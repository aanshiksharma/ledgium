import { Household } from "@/features/households"
import { ExpenseDebt, useExpenses } from "@/features/expenses"

import { ExpenseListRow, ExpenseListRowSkeleton } from "./expense-list-row"
import { Table, TableBody } from "@/components/ui/table"

export function ExpenseList({
  viewMode,
  currentHousehold,
}: {
  viewMode: "grid" | "list"
  currentHousehold: Household
}) {
  const { expenses, isLoading: expensesLoading, isSubmitting } = useExpenses()

  if (expensesLoading) {
    return (
      <Table>
        <TableBody>
          {Array.from(new Array(15)).map((_, index) => (
            <ExpenseListRowSkeleton key={index} />
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
              (debt: ExpenseDebt) =>
                (debt._count?.settlementAllocations ?? 0) > 0
            )

            return <ExpenseListRow key={expense.id} expense={expense} />
          })}
        </TableBody>
      </Table>
    </div>
  )
}
