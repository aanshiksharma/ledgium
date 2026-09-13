"use client"

import { useCallback, useEffect, useState } from "react"
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  deleteTransfer,
  getTransactions,
  updateTransaction,
} from "../api/transaction-api"
import type {
  CreateTransactionInput,
  CreateTransferInput,
  Transaction,
  TransactionFilters,
  UpdateTransactionInput,
} from "../types/transaction.types"

export function useTransactions(
  householdId: string | null,
  filters: TransactionFilters = {}
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!householdId) {
      setTransactions([])
      setTotal(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getTransactions(householdId, filters)
      setTransactions(response.transactions)
      setTotal(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions.")
    } finally {
      setIsLoading(false)
    }
  }, [
    householdId,
    filters.accountId,
    filters.categoryId,
    filters.from,
    filters.to,
    filters.limit,
    filters.offset,
  ])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: CreateTransactionInput) => {
    if (!householdId) throw new Error("No household selected.")
    const result = await createTransaction(householdId, input)
    await load()
    return result
  }, [householdId, load])

  const update = useCallback(async (
    transactionId: string,
    input: UpdateTransactionInput
  ) => {
    if (!householdId) throw new Error("No household selected.")
    const result = await updateTransaction(householdId, transactionId, input)
    await load()
    return result
  }, [householdId, load])

  const remove = useCallback(async (transactionId: string) => {
    if (!householdId) throw new Error("No household selected.")
    await deleteTransaction(householdId, transactionId)
    await load()
  }, [householdId, load])

  const transfer = useCallback(async (input: CreateTransferInput) => {
    if (!householdId) throw new Error("No household selected.")
    const result = await createTransfer(householdId, input)
    await load()
    return result
  }, [householdId, load])

  const removeTransfer = useCallback(async (transferId: string) => {
    if (!householdId) throw new Error("No household selected.")
    await deleteTransfer(householdId, transferId)
    await load()
  }, [householdId, load])

  return {
    transactions,
    total,
    isLoading,
    error,
    refresh: load,
    create,
    update,
    remove,
    transfer,
    removeTransfer,
  }
}
