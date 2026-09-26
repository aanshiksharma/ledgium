"use client"

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react"

import {
  createExpense,
  getExpenses,
  updateExpense,
} from "@/features/expenses/api/expense-api"

import type {
  CreateExpenseInput,
  Expense,
  ExpenseFilters,
  UpdateExpenseInput,
} from "@/features/expenses"
import { useHousehold } from "./household-provider"

type ExpensesContextValue = {
  expenses: Expense[]
  isLoading: boolean
  isSubmitting: boolean
  total: number
  error: string | null
  refresh: () => Promise<void>
  create: (input: CreateExpenseInput) => Promise<Expense>
  update: (expenseId: string, input: UpdateExpenseInput) => Promise<Expense>
}
const ExpensesContext = createContext<ExpensesContextValue | null>(null)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const { currentHousehold } = useHousehold()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [total, setTotal] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentHousehold) {
      setExpenses([])
      setTotal(0)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getExpenses(currentHousehold.id, {})
      setExpenses(response.expenses)
      setTotal(response.total)
    } catch (requestError) {
      setExpenses([])
      setTotal(0)
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load shared expenses."
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => void refresh(), [refresh])

  const create = useCallback(
    async (input: CreateExpenseInput) => {
      if (!currentHousehold) throw new Error("No household is selected.")

      setIsSubmitting(true)
      setError(null)

      try {
        const expense = await createExpense(currentHousehold.id, input)
        await refresh()
        return expense
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to create shared expense."
        setError(message)
        throw requestError
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentHousehold, refresh]
  )

  const update = useCallback(
    async (expenseId: string, input: UpdateExpenseInput) => {
      if (!currentHousehold) throw new Error("No household is selected.")

      setIsSubmitting(true)
      setError(null)

      try {
        const expense = await updateExpense(
          currentHousehold.id,
          expenseId,
          input
        )
        await refresh()
        return expense
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to update shared expense."
        setError(message)
        throw requestError
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentHousehold, refresh]
  )

  const value = useMemo(
    () => ({
      expenses,
      isLoading,
      isSubmitting,
      total,
      error,
      refresh,
      create,
      update,
    }),
    [expenses, isLoading]
  )

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  )
}

export function useExpenses() {
  const context = useContext(ExpensesContext)

  if (!context)
    throw new Error("useExpenses must be used inside an ExpenseProvider")

  return context
}
