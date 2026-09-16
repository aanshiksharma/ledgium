export type DebtStatus = "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED"

export type Debt = {
  id: string
  debtorId: string
  creditorId: string
  amount: string
  remainingAmount: string
  currency: string
  sourceType: "HOUSEHOLD" | "PERSONAL"
  householdExpenseId: string | null
  description: string
  status: DebtStatus
  isActive: boolean
  dueDate: string | null
  createdAt: string
  updatedAt: string
  debtor: { id: string; name: string; email: string; imageUrl: string | null }
  creditor: { id: string; name: string; email: string; imageUrl: string | null }
  settlements?: {
    id: string
    amount: string
    settledAt: string
    createdBy: string
    notes: string | null
  }[]
}

export type DebtListResponse = { debts: Debt[]; total: number }
export type DebtResponse = { debt: Debt }

export type DebtBalance = {
  debtor: { id: string; name: string; email: string; imageUrl: string | null }
  creditor: { id: string; name: string; email: string; imageUrl: string | null }
  outstandingAmount: string
  currency: string
  debts: {
    id: string
    description: string
    expenseDate: string
    remainingAmount: string
  }[]
}

export type DebtSummaryResponse = {
  balances: DebtBalance[]
  currency: string
}

export type Settlement = {
  id: string
  debtId: string
  amount: string
  settledAt: string
  createdBy: string
  notes: string | null
  createdAt: string
  creator: { id: string; name: string; email: string; imageUrl: string | null }
  debt: {
    id: string
    debtor: { id: string; name: string; email: string; imageUrl: string | null }
    creditor: { id: string; name: string; email: string; imageUrl: string | null }
    currency: string
    householdExpense: { id: string; description: string; expenseDate: string }
  }
}

export type SettlementListResponse = { settlements: Settlement[]; total: number }
export type CreateSettlementInput = { amount: number; settledAt: string; notes?: string }
export type SettlementResponse = { settlement: Settlement; debt: Debt }
