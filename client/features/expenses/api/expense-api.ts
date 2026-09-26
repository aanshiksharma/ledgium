import { apiRequest } from "@/lib/api/client"

import type {
  CreateExpenseInput,
  ExpenseFilters,
  ExpenseListResponse,
  ExpenseResponse,
  UpdateExpenseInput,
} from "../types/expense.types"

function basePath(householdId: string) {
  return `/households/${householdId}/expenses`
}

export async function getExpenses(
  householdId: string,
  filters: ExpenseFilters = {}
) {
  const params = new URLSearchParams()

  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.limit !== undefined) params.set("limit", String(filters.limit))
  if (filters.offset !== undefined) params.set("offset", String(filters.offset))

  const query = params.toString()

  return apiRequest<ExpenseListResponse>(
    `${basePath(householdId)}${query ? `?${query}` : ""}`
  )
}

export async function getExpense(householdId: string, expenseId: string) {
  const response = await apiRequest<ExpenseResponse>(
    `${basePath(householdId)}/${expenseId}`
  )
  return response.expense
}

export async function createExpense(
  householdId: string,
  input: CreateExpenseInput
) {
  const response = await apiRequest<ExpenseResponse>(basePath(householdId), {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.expense
}

export async function updateExpense(
  householdId: string,
  expenseId: string,
  input: UpdateExpenseInput
) {
  const response = await apiRequest<ExpenseResponse>(
    `${basePath(householdId)}/${expenseId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  )
  return response.expense
}
