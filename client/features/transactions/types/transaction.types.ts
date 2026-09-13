export type TransactionAccount = {
  id: string
  name: string
  type: "BANK" | "CASH" | "CREDIT_CARD" | "INVESTMENT" | "OTHER"
  currency: string
}

export type TransactionCategory = {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export type TransactionCreator = {
  id: string
  name: string
  email: string
}

export type Transaction = {
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
  account: TransactionAccount
  category: TransactionCategory | null
  creator?: TransactionCreator
}

export type TransactionFilters = {
  accountId?: string
  categoryId?: string
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export type TransactionListResponse = {
  transactions: Transaction[]
  total: number
}

export type TransactionResponse = {
  transaction: Transaction
}

export type CreateTransactionInput = {
  accountId: string
  categoryId?: string | null
  amount: number
  description: string
  transactionDate: string
  notes?: string | null
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>

export type CreateTransferInput = {
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  transactionDate: string
  notes?: string | null
}

export type TransferResponse = {
  transferId: string
  outgoing: Transaction
  incoming: Transaction
}
