import { apiRequest } from "@/lib/api/client"
import type {
  AccountListResponse,
  AccountResponse,
  CreateAccountInput,
  UpdateAccountInput,
} from "../types/account.types"

function basePath(householdId: string) {
  return `/households/${householdId}/accounts`
}

export async function getAccounts(householdId: string) {
  const response = await apiRequest<AccountListResponse>(basePath(householdId))
  return response.accounts
}

export async function getAccount(householdId: string, accountId: string) {
  const response = await apiRequest<AccountResponse>(
    `${basePath(householdId)}/${accountId}`
  )
  return response.account
}

export async function createAccount(
  householdId: string,
  input: CreateAccountInput
) {
  const response = await apiRequest<AccountResponse>(basePath(householdId), {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.account
}

export async function updateAccount(
  householdId: string,
  accountId: string,
  input: UpdateAccountInput
) {
  const response = await apiRequest<AccountResponse>(
    `${basePath(householdId)}/${accountId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  )
  return response.account
}

export async function archiveAccount(householdId: string, accountId: string) {
  const response = await apiRequest<AccountResponse>(
    `${basePath(householdId)}/${accountId}/archive`,
    { method: "POST" }
  )
  return response.account
}

export async function restoreAccount(householdId: string, accountId: string) {
  const response = await apiRequest<AccountResponse>(
    `${basePath(householdId)}/${accountId}/restore`,
    { method: "POST" }
  )
  return response.account
}
