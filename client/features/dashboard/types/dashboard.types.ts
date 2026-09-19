export type DashboardHousehold = { id: string; name: string; currency: string }
export type DashboardAccount = {
  id: string
  name: string
  type: "BANK" | "CASH" | "CREDIT_CARD" | "INVESTMENT" | "OTHER"
  currency: string
  balance: string
}
export type DashboardTransactionAccount = { id: string; name: string }
export type DashboardTransactionCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
}
export type DashboardTransaction = {
  id: string
  householdId: string
  accountId: string
  categoryId: string | null
  createdBy: string
  transferId: string | null
  amount: string
  description: string
  transactionDate: string
  notes: string | null
  createdAt: string
  updatedAt: string
  account: DashboardTransactionAccount
  category: DashboardTransactionCategory | null
}
export type DashboardCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
}
export type DashboardCategoryTotal = {
  category: DashboardCategory | null
  amount: string
}
export type DashboardPeriodActivity = {
  inflow: string
  outflow: string
  netChange: string
}
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
  periodActivity: DashboardPeriodActivity
  accounts: DashboardAccount[]
  recentTransactions: DashboardTransaction[]
  categoryTotals: DashboardCategoryTotal[]
  sharedExpenses: DashboardSharedExpenses
  householdDebts: DashboardHouseholdDebts
}
export type DashboardFilters = { from?: Date; to?: Date }
export type DashboardResponse = Dashboard
