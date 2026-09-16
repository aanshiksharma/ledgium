import { apiRequest } from "@/lib/api/client"
import type {
  CreateSettlementInput,
  DebtListResponse,
  DebtResponse,
  DebtSummaryResponse,
  SettlementListResponse,
  SettlementResponse,
} from "../types/debt.types"

function basePath(householdId: string) {
  return `/households/${householdId}/debts`
}

export async function getDebts(
  householdId: string,
  options: { activeOnly?: boolean; status?: string; limit?: number; offset?: number } = {},
) {
  const params = new URLSearchParams()
  params.set("activeOnly", String(options.activeOnly ?? true))
  if (options.status) params.set("status", options.status)
  params.set("limit", String(options.limit ?? 100))
  params.set("offset", String(options.offset ?? 0))
  return apiRequest<DebtListResponse>(`${basePath(householdId)}?${params.toString()}`)
}

export async function getDebt(householdId: string, debtId: string) {
  const response = await apiRequest<DebtResponse>(`${basePath(householdId)}/${debtId}`)
  return response.debt
}

export async function getDebtSummary(householdId: string) {
  return apiRequest<DebtSummaryResponse>(`${basePath(householdId)}/summary`)
}

export async function getSettlementHistory(householdId: string, limit = 100, offset = 0) {
  return apiRequest<SettlementListResponse>(
    `${basePath(householdId)}/settlements?limit=${limit}&offset=${offset}`,
  )
}

export async function settleDebt(
  householdId: string,
  input: CreateSettlementInput,
) {
  return apiRequest<SettlementResponse>(`${basePath(householdId)}/settlements`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}
