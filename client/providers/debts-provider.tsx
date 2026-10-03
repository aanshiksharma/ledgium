"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
  ReactNode,
} from "react"

import {
  getDebts,
  getDebtSummary,
  getSettlementHistory,
  settleDebt,
} from "@/features/debts"
import type {
  CreateSettlementInput,
  Debt,
  DebtBalance,
  Settlement,
} from "@/features/debts"
import { useHousehold } from "./household-provider"

type DebtsContextValue = {
  balances: DebtBalance[]
  settlements: Settlement[]
  settlementTotal: number
  settledDebts: Debt[]
  showSettledDebts: boolean
  isLoadingSettledDebts: boolean
  isLoadingMoreSettlements: boolean
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  refresh: () => Promise<void>
  toggleSettledDebts: () => Promise<void>
  loadMoreSettlements: () => Promise<void>
  settle: (input: CreateSettlementInput) => Promise<void>
}

const DebtsContext = createContext<DebtsContextValue | null>(null)

export function DebtsProvider({ children }: { children: ReactNode }) {
  const { currentHousehold } = useHousehold()

  const [balances, setBalances] = useState<DebtBalance[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [settlementTotal, setSettlementTotal] = useState(0)
  const [settledDebts, setSettledDebts] = useState<Debt[]>([])
  const [showSettledDebts, setShowSettledDebts] = useState(false)
  const [isLoadingSettledDebts, setIsLoadingSettledDebts] = useState(false)
  const [isLoadingMoreSettlements, setIsLoadingMoreSettlements] =
    useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentHousehold) {
      setBalances([])
      setSettlements([])
      setSettlementTotal(0)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const [summary, history] = await Promise.all([
        getDebtSummary(currentHousehold.id),
        getSettlementHistory(currentHousehold.id, 100, 0),
      ])
      setBalances(summary.balances)
      setSettlements(history.settlements)
      setSettlementTotal(history.total)
    } catch (e) {
      setBalances([])
      setSettlements([])
      setSettlementTotal(0)
      setError(
        e instanceof Error ? e.message : "Failed to load debts and settlements."
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const loadSettledDebts = useCallback(async () => {
    if (!currentHousehold) return
    setIsLoadingSettledDebts(true)
    setError(null)
    try {
      const response = await getDebts(currentHousehold.id, {
        activeOnly: false,
        status: "SETTLED",
        limit: 100,
        offset: 0,
      })
      setSettledDebts(response.debts)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settled debts.")
    } finally {
      setIsLoadingSettledDebts(false)
    }
  }, [currentHousehold])

  const toggleSettledDebts = useCallback(async () => {
    if (showSettledDebts) {
      setShowSettledDebts(false)
      return
    }
    setShowSettledDebts(true)
    if (!settledDebts.length) await loadSettledDebts()
  }, [loadSettledDebts, settledDebts.length, showSettledDebts])

  const settle = useCallback(
    async (input: CreateSettlementInput) => {
      if (!currentHousehold) return
      setIsSubmitting(true)
      setError(null)
      try {
        await settleDebt(currentHousehold.id, input)
        await refresh()
        if (showSettledDebts) await loadSettledDebts()
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to record settlement."
        setError(message)
        throw e
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentHousehold, loadSettledDebts, refresh, showSettledDebts]
  )

  const loadMoreSettlements = useCallback(async () => {
    if (
      !currentHousehold ||
      isLoadingMoreSettlements ||
      settlements.length >= settlementTotal
    )
      return
    setIsLoadingMoreSettlements(true)
    setError(null)
    try {
      const history = await getSettlementHistory(
        currentHousehold.id,
        100,
        settlements.length
      )
      setSettlements((current) => [...current, ...history.settlements])
      setSettlementTotal(history.total)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load more settlements."
      )
    } finally {
      setIsLoadingMoreSettlements(false)
    }
  }, [
    currentHousehold,
    isLoadingMoreSettlements,
    settlementTotal,
    settlements.length,
  ])

  const value = useMemo(
    () => ({
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
    }),
    [
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
    ]
  )

  return <DebtsContext.Provider value={value}>{children}</DebtsContext.Provider>
}

export function useDebts() {
  const context = useContext(DebtsContext)

  if (!context) throw new Error("useDebts must be used inside a DebtsProvider")

  return context
}
