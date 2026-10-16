export type DashboardHousehold = { id: string; name: string; currency: string }

export type DashboardSharedExpenses = {
  total: string
  count: number
  currency: string
}

export type DashboardHouseholdDebts = {
  amountOwed: string
  amountReceivable: string
  openCount: number
  currency: string
}

export type Dashboard = {
  household: DashboardHousehold
  totalBalance: string
  sharedExpenses: DashboardSharedExpenses
  householdDebts: DashboardHouseholdDebts
}

export type DashboardFilters = { from?: Date; to?: Date }

export type DashboardResponse = Dashboard
