"use client"

import { useState } from "react"

import { Item, ItemActions, ItemHeader, ItemTitle } from "@/components/ui/item"
import { Button } from "@/components/ui/button"

import {
  LoadingHousehold,
  NoCurrentHousehold,
  ZeroHouseholds,
  useHousehold,
} from "@/features/households"
import {
  HouseholdOverview,
  useDashboard,
  type DashboardFilters,
} from "@/features/dashboard"

export function DashboardPage() {
  const {
    isLoading: householdLoading,
    error: householdError,
    households,
    currentHousehold,
  } = useHousehold()
  const [filters, setFilters] = useState<DashboardFilters>({})

  const {
    dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refresh,
  } = useDashboard(currentHousehold?.id ?? null, filters)

  const error = householdError ?? dashboardError

  if (householdLoading) return <LoadingHousehold />

  if (households.length === 0) return <ZeroHouseholds />

  if (!currentHousehold) return <NoCurrentHousehold households={households} />

  if (!dashboard) return <p>Loading dashboard details</p>

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <section className="rounded-2xl border border-destructive/30 p-5">
          <Item size="xs">
            <ItemHeader>
              <ItemTitle>{error}</ItemTitle>
              <ItemActions>
                <Button
                  variant="outline"
                  disabled={dashboardLoading}
                  onClick={() => void refresh()}
                >
                  Retry
                </Button>
              </ItemActions>
            </ItemHeader>
          </Item>
        </section>
      )}

      <HouseholdOverview currentHousehold={currentHousehold} />
    </div>
  )
}
