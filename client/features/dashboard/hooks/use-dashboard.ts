"use client"

import { useCallback, useEffect, useState } from "react"
import { getDashboard } from "../api/dashboard-api"
import type { Dashboard, DashboardFilters } from "../types/dashboard.types"

export function useDashboard(
  householdId: string | null,
  filters: DashboardFilters = {}
) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setDashboard(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getDashboard(householdId, filters)
      setDashboard(response)
    } catch (e) {
      setDashboard(null)
      setError(e instanceof Error ? e.message : "Failed to load dashboard.")
    } finally {
      setIsLoading(false)
    }
  }, [householdId, filters.from, filters.to])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { dashboard, isLoading, error, refresh }
}
