export type DebtStatus = "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED"

export type Person = {
  id: string
  name: string
  email: string
  imageUrl: string | null
}

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
  householdExpense: { id: string; description: string; expenseDate: string; totalAmount: string; currency: string } | null
  debtor: Person
  creditor: Person
  settlementAllocations?: {
    id: string
    amount: string
    settlement: {
      id: string
      settledAt: string
      createdBy: string
      notes: string | null
    }
  }[]
}

export type DebtListResponse = { debts: Debt[]; total: number }
export type DebtResponse = { debt: Debt }

export type DebtBalance = {
  debtor: Person
  creditor: Person
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

export type SettlementAllocation = {
  id: string
  debtId: string
  amount: string
}

export type Settlement = {
  id: string
  debtorId: string
  creditorId: string
  amount: string
  settledAt: string
  createdBy: string
  notes: string | null
  createdAt: string
  creator: Person
  debtor: Person
  creditor: Person
  allocations: {
    amount: string
    debt: {
      id: string
      currency: string
      householdExpense: { id: string; description: string; expenseDate: string } | null
    }
  }[]
}

export type SettlementListResponse = { settlements: Settlement[]; total: number }

export type CreateSettlementInput = {
  debtorId: string
  creditorId: string
  amount: number
  settledAt: string
  notes?: string
}

export type SettlementResponse = {
  settlement: Settlement
  allocations: SettlementAllocation[]
  remainingRelationship: string
}
