"use client"

import { useCallback, useEffect, useState } from "react"
import { getDebts, getDebtSummary, getSettlementHistory, settleDebt } from "../api/debt-api"
import type { CreateSettlementInput, Debt, DebtBalance, Settlement } from "../types/debt.types"

export function useDebts(householdId: string | null) {
  const [balances, setBalances] = useState<DebtBalance[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [settlementTotal, setSettlementTotal] = useState(0)
  const [settledDebts, setSettledDebts] = useState<Debt[]>([])
  const [showSettledDebts, setShowSettledDebts] = useState(false)
  const [isLoadingSettledDebts, setIsLoadingSettledDebts] = useState(false)
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

  useEffect(() => { void refresh() }, [refresh])

  const loadSettledDebts = useCallback(async () => {
    if (!householdId) return
    setIsLoadingSettledDebts(true)
    setError(null)
    try {
      const response = await getDebts(householdId, { activeOnly: false, status: "SETTLED", limit: 100, offset: 0 })
      setSettledDebts(response.debts)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settled debts.")
    } finally {
      setIsLoadingSettledDebts(false)
    }
  }, [householdId])

  const toggleSettledDebts = useCallback(async () => {
    if (showSettledDebts) {
      setShowSettledDebts(false)
      return
    }
    setShowSettledDebts(true)
    if (!settledDebts.length) await loadSettledDebts()
  }, [loadSettledDebts, settledDebts.length, showSettledDebts])

  const settle = useCallback(async (input: CreateSettlementInput) => {
    if (!householdId) return
    setIsSubmitting(true)
    setError(null)
    try {
      await settleDebt(householdId, input)
      await refresh()
      if (showSettledDebts) await loadSettledDebts()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to record settlement."
      setError(message)
      throw e
    } finally {
      setIsSubmitting(false)
    }
  }, [householdId, loadSettledDebts, refresh, showSettledDebts])

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
    settledDebts,
    showSettledDebts,
    isLoadingSettledDebts,
    isLoadingMoreSettlements,
    isLoading,
    isSubmitting,
    error,
    refresh,
    toggleSettledDebts,
    loadMoreSettlements,
    settle,
  }
}
