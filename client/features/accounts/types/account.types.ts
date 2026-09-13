export type AccountType =
  | "BANK"
  | "CASH"
  | "CREDIT_CARD"
  | "INVESTMENT"
  | "OTHER"

export type Account = {
  id: string
  householdId: string
  name: string
  type: AccountType
  openingBalance: string
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    transactions: number
  }
}

export type CreateAccountInput = {
  name: string
  type: AccountType
  openingBalance?: number
  currency?: string
}

export type UpdateAccountInput = Partial<CreateAccountInput>

export type AccountListResponse = {
  accounts: Account[]
}

export type AccountResponse = {
  account: Account
}
