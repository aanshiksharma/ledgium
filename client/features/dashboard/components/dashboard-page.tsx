"use client"

import { useState } from "react"
import { CreateHouseholdForm, useHousehold } from "@/features/households"
import { useDashboard } from "../hooks/use-dashboard"
import type { DashboardFilters } from "../types/dashboard.types"
import { DashboardDateFilter } from "./dashboard-date-filter"
import { DashboardSummary } from "./dashboard-summary"
import { AccountBalances } from "./account-balances"
import { CategoryBreakdown } from "./category-breakdown"
import { RecentTransactions } from "./recent-transactions"

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
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </section>
    )

  if (households.length === 0)
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <CreateHouseholdForm />
      </section>
    )

  if (!currentHousehold)
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          No household is currently selected.
        </p>
      </section>
    )

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentHousehold.name} · {currentHousehold.currency}
        </p>
      </header>

      <DashboardDateFilter
        value={filters}
        onApply={setFilters}
        disabled={dashboardLoading}
      />

      {error ? (
        <div className="rounded-2xl border border-destructive/30 p-5">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>

          <button
            type="button"
            className="mt-3 text-sm font-medium underline"
            onClick={() => void refresh()}
            disabled={dashboardLoading}
          >
            Retry
          </button>
        </div>
      ) : null}

      {dashboardLoading || !dashboard ? (
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      ) : null}

      {dashboard ? (
        <>
          <DashboardSummary
            totalBalance={dashboard.totalBalance}
            periodActivity={dashboard.periodActivity}
            currency={dashboard.household.currency}
          />
          <div className="grid gap-6 lg:grid-cols-2">
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
        </>
      ) : null}
    </section>
  )
}
