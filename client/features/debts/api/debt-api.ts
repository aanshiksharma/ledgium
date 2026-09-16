import { apiRequest } from "@/lib/api/client"
import type { CreateSettlementInput, DebtListResponse, DebtResponse, SettlementResponse } from "../types/debt.types"
function basePath(householdId: string) { return `/households/${householdId}/debts` }
export async function getDebts(householdId: string) { return apiRequest<DebtListResponse>(basePath(householdId)) }
export async function getDebt(householdId: string, debtId: string) { const r = await apiRequest<DebtResponse>(`${basePath(householdId)}/${debtId}`); return r.debt }
export async function settleDebt(householdId: string, debtId: string, input: CreateSettlementInput) { return apiRequest<SettlementResponse>(`${basePath(householdId)}/${debtId}/settlements`, { method: "POST", body: JSON.stringify(input) }) }
