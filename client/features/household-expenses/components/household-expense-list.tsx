import { Button } from "@/components/ui/button"

import type { HouseholdExpense } from "../types/household-expense.types"

function money(value: string, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(Number(value))
}

export function HouseholdExpenseList({
  expenses,
  isLoading,
  onEdit,
}: {
  expenses: HouseholdExpense[]
  isLoading: boolean
  onEdit: (expense: HouseholdExpense) => void
}) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading shared expenses...
      </p>
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
    <div className="space-y-3">
      {expenses.map((expense) => {
        const hasSettlements = expense.debts.some(
          (debt) => (debt._count?.settlements ?? 0) > 0
        )

        return (
          <article
            key={expense.id}
            className="rounded-2xl border bg-card p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">{expense.description}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {expense.category?.name ?? "Uncategorized"} ·{" "}
                  {new Date(expense.expenseDate).toLocaleDateString()} · paid by{" "}
                  {expense.payers.map((payer) => payer.user.name).join(", ")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <strong>{money(expense.totalAmount, expense.currency)}</strong>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(expense)}
                >
                  Edit
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Obligations: </span>
                {expense.participants
                  .map(
                    (participant) =>
                      `${participant.user.name} (${money(
                        participant.shareAmount,
                        expense.currency
                      )})`
                  )
                  .join(", ")}
              </div>

              <div>
                <span className="text-muted-foreground">Debts created: </span>
                {expense.debts.length}
                {hasSettlements && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    · settlement recorded
                  </span>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
