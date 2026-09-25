import type {
  HouseholdExpense,
  HouseholdExpenseInput,
} from "@/features/household-expenses"

export type SplitMode = "equal" | "custom"

export type HouseholdExpenseFormValues = {
  description: string
  categoryId: string
  totalAmount: string
  expenseDate: string
  participantIds: string[]
  splitMode: SplitMode
  customAmounts: Record<string, string>
  payerId: string
}

export type HouseholdExpenseFormProps = {
  householdId: string
  currency: string
  expense?: HouseholdExpense | null
  onSuccess?: () => void
}
