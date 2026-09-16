"use client"

import { useCallback, useEffect, useState } from "react"
import { getDebtSummary, getSettlementHistory, settleDebt } from "../api/debt-api"
import type { CreateSettlementInput, DebtBalance, Settlement } from "../types/debt.types"

export function useDebts(householdId: string | null) {
  const [balances, setBalances] = useState<DebtBalance[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [settlementTotal, setSettlementTotal] = useState(0)
  const [isLoadingMoreSettlements, setIsLoadingMoreSettlements] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setBalances([])
      setSettlements([])
      setSettlementTotal(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [summary, history] = await Promise.all([
        getDebtSummary(householdId),
        getSettlementHistory(householdId, 100, 0),
      ])
      setBalances(summary.balances)
      setSettlements(history.settlements)
      setSettlementTotal(history.total)
    } catch (e) {
      setBalances([])
      setSettlements([])
      setSettlementTotal(0)
      setError(e instanceof Error ? e.message : "Failed to load debts and settlements.")
    } finally {
      setIsLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const settle = useCallback(
    async (debtId: string, input: CreateSettlementInput) => {
      if (!householdId) return

      setIsSubmitting(true)
      setError(null)

      try {
        await settleDebt(householdId, debtId, input)
        await refresh()
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to record settlement."
        setError(message)
        throw e
      } finally {
        setIsSubmitting(false)
      }
    },
    [householdId, refresh],
  )


  const loadMoreSettlements = useCallback(async () => {
    if (!householdId || isLoadingMoreSettlements || settlements.length >= settlementTotal) return

    setIsLoadingMoreSettlements(true)
    setError(null)

    try {
      const history = await getSettlementHistory(householdId, 100, settlements.length)
      setSettlements((current) => [...current, ...history.settlements])
      setSettlementTotal(history.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more settlements.")
    } finally {
      setIsLoadingMoreSettlements(false)
    }
  }, [householdId, isLoadingMoreSettlements, settlementTotal, settlements.length])

  return {
    balances,
    settlements,
    settlementTotal,
    isLoadingMoreSettlements,
    isLoading,
    isSubmitting,
    error,
    refresh,
    loadMoreSettlements,
    settle,
  }
}
