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

export async function getDebts(householdId: string) {
  return apiRequest<DebtListResponse>(basePath(householdId))
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
  debtId: string,
  input: CreateSettlementInput,
) {
  return apiRequest<SettlementResponse>(`${basePath(householdId)}/${debtId}/settlements`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}
