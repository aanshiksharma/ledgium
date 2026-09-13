import { apiRequest } from "@/lib/api/client"
import type {
  CreateTransactionInput,
  CreateTransferInput,
  TransactionFilters,
  TransactionListResponse,
  TransactionResponse,
  TransferResponse,
  UpdateTransactionInput,
} from "../types/transaction.types"

function basePath(householdId: string) {
  return `/households/${householdId}/transactions`
}

export async function getTransactions(
  householdId: string,
  filters: TransactionFilters = {}
) {
  const params = new URLSearchParams()

  if (filters.accountId) params.set("accountId", filters.accountId)
  if (filters.categoryId) params.set("categoryId", filters.categoryId)
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.limit !== undefined) params.set("limit", String(filters.limit))
  if (filters.offset !== undefined) params.set("offset", String(filters.offset))

  const query = params.toString()
  return apiRequest<TransactionListResponse>(
    `${basePath(householdId)}${query ? `?${query}` : ""}`
  )
}

export async function getTransaction(
  householdId: string,
  transactionId: string
) {
  const response = await apiRequest<TransactionResponse>(
    `${basePath(householdId)}/${transactionId}`
  )
  return response.transaction
}

export async function createTransaction(
  householdId: string,
  input: CreateTransactionInput
) {
  const response = await apiRequest<TransactionResponse>(basePath(householdId), {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.transaction
}

export async function updateTransaction(
  householdId: string,
  transactionId: string,
  input: UpdateTransactionInput
) {
  const response = await apiRequest<TransactionResponse>(
    `${basePath(householdId)}/${transactionId}`,
    { method: "PATCH", body: JSON.stringify(input) }
  )
  return response.transaction
}

export async function deleteTransaction(
  householdId: string,
  transactionId: string
) {
  await apiRequest<unknown>(
    `${basePath(householdId)}/${transactionId}`,
    { method: "DELETE" }
  )
}

export async function createTransfer(
  householdId: string,
  input: CreateTransferInput
) {
  return apiRequest<TransferResponse>(`${basePath(householdId)}/transfers`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function deleteTransfer(
  householdId: string,
  transferId: string
) {
  await apiRequest<unknown>(
    `${basePath(householdId)}/transfers/${transferId}`,
    { method: "DELETE" }
  )
}
