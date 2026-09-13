"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"
import { getTransaction, updateTransaction } from "../api/transaction-api"
import { TransactionForm } from "./transaction-form"
import type { Transaction } from "../types/transaction.types"

type Props = { transactionId: string }

export function TransactionDetail({ transactionId }: Props) {
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentHousehold) return

    setIsLoading(true)
    setError(null)

    void getTransaction(currentHousehold.id, transactionId)
      .then(setTransaction)
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load transaction."
        )
      })
      .finally(() => setIsLoading(false))
  }, [currentHousehold, transactionId])

  if (isHouseholdLoading || isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading transaction...</p>
    )
  }

  if (!currentHousehold || !transaction) {
    return (
      <div className="rounded-2xl border p-6">
        <p className="text-sm text-muted-foreground">
          {error ?? "Transaction not found."}
        </p>
      </div>
    )
  }

  async function handleUpdate(input: Parameters<typeof updateTransaction>[2]) {
    setIsSubmitting(true)
    try {
      if (!currentHousehold || !transaction) return

      const updated = await updateTransaction(
        currentHousehold.id,
        transaction.id,
        input
      )
      setTransaction(updated)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Edit transaction</h1>
        {transaction.transferId ? (
          <div className="rounded-xl border p-4 text-sm">
            Transfer transactions must be modified through the transfer
            operation.
          </div>
        ) : (
          <TransactionForm
            accounts={[transaction.account]}
            categories={transaction.category ? [transaction.category] : []}
            transaction={transaction}
            isSubmitting={isSubmitting}
            onSubmit={async (input) => handleUpdate(input)}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{transaction.description}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(transaction.transactionDate).toLocaleDateString()}
          </p>
        </div>
        {!transaction.transferId && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="mt-1 text-xl font-semibold">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: transaction.account.currency,
            }).format(Number(transaction.amount))}
          </p>
        </div>
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-muted-foreground">Account</p>
          <p className="mt-1 font-medium">{transaction.account.name}</p>
        </div>
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-muted-foreground">Category</p>
          <p className="mt-1 font-medium">
            {transaction.category?.name ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-muted-foreground">Created by</p>
          <p className="mt-1 font-medium">
            {transaction.creator?.name ?? "Unknown"}
          </p>
        </div>
      </div>

      {transaction.notes && (
        <div className="rounded-2xl border p-5">
          <p className="text-sm font-medium">Notes</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
            {transaction.notes}
          </p>
        </div>
      )}
    </section>
  )
}
