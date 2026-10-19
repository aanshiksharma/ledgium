"use client"

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react"

import { useHousehold } from "@/features/households"
import type { Dashboard, DashboardFilters } from "@/features/dashboard"
import { getDashboard } from "@/features/dashboard"

type DashboardContextValues = {
  dashboard: Dashboard | null
  filters: DashboardFilters
  isLoading: boolean
  error: string | null

  refresh: () => Promise<void>
  setFilters: Dispatch<SetStateAction<DashboardFilters>>
}

const DashboardContext = createContext<DashboardContextValues | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { currentHousehold } = useHousehold()

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentHousehold) {
      setDashboard(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getDashboard(currentHousehold.id, filters)
      setDashboard(response)
    } catch (e) {
      setDashboard(null)
      setError(e instanceof Error ? e.message : "Failed to load dashboard.")
    } finally {
      setIsLoading(false)
    }
  }, [currentHousehold, filters])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      dashboard,
      filters,
      isLoading,
      error,
      refresh,
      setFilters,
    }),
    [dashboard, filters, isLoading, error, refresh, setFilters]
  )

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)

  if (!context)
    throw new Error("useDashboard must only be used under a DashboardProvider")

  return context
}
