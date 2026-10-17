"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import {
  LoadingHousehold,
  NoCurrentHousehold,
  ZeroHouseholds,
  useHousehold,
} from "@/features/households"
import { HouseholdOverview, useDashboard } from "@/features/dashboard"

export function DashboardPage() {
  const {
    isLoading,
    error: householdError,
    households,
    currentHousehold,
  } = useHousehold()
  const { error: dashboardError } = useDashboard()

  useEffect(() => {
    const error = householdError ?? dashboardError
    if (!error) return

    toast.error(error)
  }, [householdError, dashboardError])

  if (isLoading) return <LoadingHousehold />

  if (households.length === 0) return <ZeroHouseholds />

  if (!currentHousehold) return <NoCurrentHousehold households={households} />

  return <HouseholdOverview />
}
