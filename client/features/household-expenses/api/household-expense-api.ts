import { apiRequest } from "@/lib/api/client"

import type {
  CreateHouseholdExpenseInput,
  HouseholdExpenseFilters,
  HouseholdExpenseListResponse,
  HouseholdExpenseResponse,
  UpdateHouseholdExpenseInput,
} from "../types/household-expense.types"

function basePath(householdId: string) {
  return `/households/${householdId}/expenses`
}

export async function getHouseholdExpenses(
  householdId: string,
  filters: HouseholdExpenseFilters = {}
) {
  const params = new URLSearchParams()

  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.limit !== undefined) params.set("limit", String(filters.limit))
  if (filters.offset !== undefined) params.set("offset", String(filters.offset))

  const query = params.toString()

  return apiRequest<HouseholdExpenseListResponse>(
    `${basePath(householdId)}${query ? `?${query}` : ""}`
  )
}

export async function getHouseholdExpense(
  householdId: string,
  expenseId: string
) {
  const response = await apiRequest<HouseholdExpenseResponse>(
    `${basePath(householdId)}/${expenseId}`
  )
  return response.expense
}

export async function createHouseholdExpense(
  householdId: string,
  input: CreateHouseholdExpenseInput
) {
  const response = await apiRequest<HouseholdExpenseResponse>(
    basePath(householdId),
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  )
  return response.expense
}

export async function updateHouseholdExpense(
  householdId: string,
  expenseId: string,
  input: UpdateHouseholdExpenseInput
) {
  const response = await apiRequest<HouseholdExpenseResponse>(
    `${basePath(householdId)}/${expenseId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  )
  return response.expense
}
