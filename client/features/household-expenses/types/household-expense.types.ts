export type ExpenseUser = {
  id: string
  name: string
  email: string
  imageUrl?: string | null
}

export type ExpenseCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
  parentId: string | null
  isDefault: boolean
}

export type ExpensePayer = {
  id: string
  userId: string
  paidAmount: string
  user: ExpenseUser
}

export type ExpenseParticipant = {
  id: string
  userId: string
  shareAmount: string
  sharePercentage: string | null
  user: ExpenseUser
}

export type ExpenseDebt = {
  id: string
  debtorId: string
  creditorId: string
  amount: string
  currency: string
  status: "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED"
  _count?: {
    settlementAllocations: number
  }
}

export type HouseholdExpense = {
  id: string
  householdId: string
  categoryId: string | null
  description: string
  totalAmount: string
  currency: string
  expenseDate: string
  notes: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  category: ExpenseCategory | null
  creator: ExpenseUser
  payers: ExpensePayer[]
  participants: ExpenseParticipant[]
  debts: ExpenseDebt[]
}

export type HouseholdExpenseInput = {
  description: string
  categoryId: string
  totalAmount: number
  expenseDate: string
  payers: { userId: string; paidAmount: number }[]
  participants: {
    userId: string
    shareAmount: number
    sharePercentage?: number
  }[]
}

export type CreateHouseholdExpenseInput = HouseholdExpenseInput
export type UpdateHouseholdExpenseInput = HouseholdExpenseInput

export type HouseholdExpenseFilters = {
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export type HouseholdExpenseListResponse = {
  expenses: HouseholdExpense[]
  total: number
}

export type HouseholdExpenseResponse = {
  expense: HouseholdExpense
}
