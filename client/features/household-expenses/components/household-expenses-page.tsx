"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useHousehold } from "@/features/households"

import { useHouseholdExpenses } from "../hooks/use-household-expenses"
import type { HouseholdExpense } from "../types/household-expense.types"
import { HouseholdExpenseForm } from "./household-expense-form"
import { HouseholdExpenseList } from "./household-expense-list"

export function HouseholdExpensesPage() {
  const { currentHousehold, isLoading: householdLoading } = useHousehold()

  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] =
    useState<HouseholdExpense | null>(null)

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [offset, setOffset] = useState(0)

  const filters = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      limit: 50,
      offset,
    }),
    [from, to, offset]
  )

  const {
    expenses,
    total,
    isLoading,
    isSubmitting,
    error,
    refresh,
    create,
    update,
  } = useHouseholdExpenses(currentHousehold?.id ?? null, filters)

  if (householdLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading household...</p>
    )
  }

  if (!currentHousehold) {
    return (
      <div className="rounded-2xl border p-6">
        <h2 className="font-semibold">No household selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select or create a household before recording shared expenses.
        </p>
      </div>
    )
  }

  function openCreate() {
    setEditingExpense(null)
    setFormOpen(true)
  }

  function openEdit(expense: HouseholdExpense) {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  function closeForm() {
    if (isSubmitting) return
    setFormOpen(false)
    setEditingExpense(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Shared expenses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record shared spending, split obligations, and track who owes whom.
          </p>
        </div>

        <Button onClick={formOpen ? closeForm : openCreate}>
          {formOpen ? "Close" : "Add expense"}
        </Button>
      </div>

      {formOpen && (
        <div className="rounded-2xl border bg-card p-6">
          <HouseholdExpenseForm
            key={editingExpense?.id ?? "new"}
            householdId={currentHousehold.id}
            currency={currentHousehold.currency}
            expense={editingExpense}
            isSubmitting={isSubmitting}
            onSubmit={async (input) => {
              if (editingExpense) {
                await update(editingExpense.id, input)
              } else {
                await create(input)
              }

              closeForm()
            }}
            onCancel={closeForm}
          />
        </div>
      )}

      <div className="rounded-2xl border p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">From</span>
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value)
                setOffset(0)
              }}
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="font-medium">To</span>
            <input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value)
                setOffset(0)
              }}
              className="h-10 w-full rounded-md border bg-background px-3"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}

      <HouseholdExpenseList
        expenses={expenses}
        isLoading={isLoading}
        onEdit={openEdit}
      />

      {total > 50 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={offset === 0 || isLoading}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + 50, total)} of {total}
          </span>

          <Button
            variant="outline"
            disabled={offset + 50 >= total || isLoading}
            onClick={() => setOffset(offset + 50)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}
