"use client"

import { useState } from "react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Item, ItemActions, ItemHeader, ItemTitle } from "@/components/ui/item"

import { useHousehold } from "@/features/households"
import { useDashboard } from "../hooks/use-dashboard"
import type { DashboardFilters } from "../types/dashboard.types"

import { DashboardSummary } from "./dashboard-summary"
import { AccountBalances } from "./account-balances"
import { CategoryBreakdown } from "./category-breakdown"
import { RecentTransactions } from "./recent-transactions"
import { HouseholdOverview } from "./household-overview"
import {
  NoCurrentHousehold,
  ZeroHouseholds,
} from "../../households/components/error-states"

import { ProgressBar } from "@/components/common/progress-bar"
import { Button } from "@/components/ui/button"

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

  if (householdLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <ProgressBar
          loading={householdLoading}
          loadingText="Loading Households"
        />
      </div>
    )

  if (households.length === 0) return <ZeroHouseholds />

  if (!currentHousehold) return <NoCurrentHousehold households={households} />

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-2xl border border-destructive/30 p-5">
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
        </div>
      )}

      <Tabs defaultValue="household">
        <div className="mb-4 flex items-start justify-between border-b">
          <TabsList variant="line">
            <TabsTrigger value="household">Household</TabsTrigger>

            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="household">
          <HouseholdOverview currentHouseholdId={currentHousehold.id} />
        </TabsContent>

        <TabsContent value="personal">
          {dashboardLoading || !dashboard ? (
            "Loading"
          ) : (
            <div className="flex flex-col gap-4">
              <DashboardSummary
                totalBalance={dashboard.totalBalance}
                periodActivity={dashboard.periodActivity}
                currency={dashboard.household.currency}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <AccountBalances accounts={dashboard.accounts} />

                <CategoryBreakdown
                  categoryTotals={dashboard.categoryTotals}
                  currency={dashboard.household.currency}
                />
              </div>

              <RecentTransactions
                transactions={dashboard.recentTransactions}
                currency={dashboard.household.currency}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
