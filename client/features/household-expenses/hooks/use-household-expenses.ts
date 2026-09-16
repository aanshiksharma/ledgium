"use client"

import { useCallback, useEffect, useState } from "react"

import {
  createHouseholdExpense,
  getHouseholdExpenses,
  updateHouseholdExpense,
} from "../api/household-expense-api"

import type {
  CreateHouseholdExpenseInput,
  HouseholdExpense,
  HouseholdExpenseFilters,
  UpdateHouseholdExpenseInput,
} from "../types/household-expense.types"

export function useHouseholdExpenses(
  householdId: string | null,
  filters: HouseholdExpenseFilters = {}
) {
  const [expenses, setExpenses] = useState<HouseholdExpense[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setExpenses([])
      setTotal(0)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getHouseholdExpenses(householdId, filters)
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
  }, [householdId, filters.from, filters.to, filters.limit, filters.offset])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateHouseholdExpenseInput) => {
      if (!householdId) throw new Error("No household is selected.")

      setIsSubmitting(true)
      setError(null)

      try {
        const expense = await createHouseholdExpense(householdId, input)
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
    [householdId, refresh]
  )

  const update = useCallback(
    async (expenseId: string, input: UpdateHouseholdExpenseInput) => {
      if (!householdId) throw new Error("No household is selected.")

      setIsSubmitting(true)
      setError(null)

      try {
        const expense = await updateHouseholdExpense(
          householdId,
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
    [householdId, refresh]
  )

  return {
    expenses,
    total,
    isLoading,
    isSubmitting,
    error,
    refresh,
    create,
    update,
  }
}
