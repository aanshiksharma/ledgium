"use client"

import { useEffect } from "react"

import { ListPlus, RefreshCcw, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"

import {
  useHousehold,
  NoCurrentHousehold,
  LoadingHousehold,
} from "@/features/households"
import {
  useExpenses,
  ExpenseList,
  ExpenseFormButton,
} from "@/features/expenses"

import { ExpensePagination } from "./expense-pagination"

export function ExpensesPage() {
  const {
    currentHousehold,
    households,
    isLoading: householdLoading,
  } = useHousehold()

  const isMobile = useIsMobile()

  const { isLoading, error, refresh } = useExpenses()

  useEffect(() => {
    if (!error) return
    toast(error)
  }, [error])

  if (householdLoading) return <LoadingHousehold />

  if (!currentHousehold) return <NoCurrentHousehold households={households} />

  return (
    <>
      <section className="flex flex-col gap-4 lg:gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage Expenses
          </h1>
        </header>

        <div className="flex items-center gap-2">
          <Field className="flex-1">
            <Input placeholder="Search expenses..." />
          </Field>

          <Button variant="outline" size="icon">
            <SlidersHorizontal />
          </Button>

          <Button variant="outline" size="icon" onClick={() => void refresh()}>
            <RefreshCcw className={isLoading ? "animate-spin" : ""} />
          </Button>

          <ExpenseFormButton>
            {isMobile ? (
              <Button size="icon">
                <ListPlus />
              </Button>
            ) : (
              <Button>Add Expense</Button>
            )}
          </ExpenseFormButton>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}

      <ExpenseList />

      <ExpensePagination />
    </>
  )
}
