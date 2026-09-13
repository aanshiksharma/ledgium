"use client"

import { useCallback, useEffect, useState } from "react"

import {
  archiveAccount,
  createAccount,
  getAccount,
  getAccounts,
  restoreAccount,
  updateAccount,
} from "../api/account-api"
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../types/account.types"

export function useAccounts(householdId: string | null) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setAccounts([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setAccounts(await getAccounts(householdId))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load accounts."
      )
    } finally {
      setIsLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateAccountInput) => {
      if (!householdId) throw new Error("No household is selected.")

      const account = await createAccount(householdId, input)
      setAccounts((current) => [...current, account])
      return account
    },
    [householdId]
  )

  const update = useCallback(
    async (accountId: string, input: UpdateAccountInput) => {
      if (!householdId) throw new Error("No household is selected.")

      const account = await updateAccount(householdId, accountId, input)
      setAccounts((current) =>
        current.map((item) => (item.id === account.id ? account : item))
      )
      return account
    },
    [householdId]
  )

  const setActive = useCallback(
    async (accountId: string, active: boolean) => {
      if (!householdId) throw new Error("No household is selected.")

      const account = active
        ? await restoreAccount(householdId, accountId)
        : await archiveAccount(householdId, accountId)

      setAccounts((current) =>
        current.map((item) => (item.id === account.id ? account : item))
      )
      return account
    },
    [householdId]
  )

  return { accounts, isLoading, error, refresh, create, update, setActive }
}

export function useAccount(
  householdId: string | null,
  accountId: string | null
) {
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId || !accountId) {
      setAccount(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setAccount(await getAccount(householdId, accountId))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load account."
      )
    } finally {
      setIsLoading(false)
    }
  }, [householdId, accountId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { account, setAccount, isLoading, error, refresh }
}
