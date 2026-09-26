import type { Expense } from "@/features/expenses"

export type SplitMode = "equal" | "custom"

export type ExpenseFormValues = {
  description: string
  categoryId: string
  totalAmount: string
  expenseDate: string
  participantIds: string[]
  splitMode: SplitMode
  customAmounts: Record<string, string>
  payerId: string
}

export type ExpenseFormProps = {
  householdId: string
  currency: string
  expense?: Expense | null
  onSuccess?: () => void
}
