"use client"

import { SubmitEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import type {
  CreateTransactionInput,
  Transaction,
} from "../types/transaction.types"

type Props = {
  accounts: { id: string; name: string; currency: string }[]
  categories?: { id: string; name: string }[]
  transaction?: Transaction | null
  isSubmitting: boolean
  onSubmit: (input: CreateTransactionInput) => Promise<void>
  onCancel?: () => void
}

function dateValue(value?: string) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10)
}

export function TransactionForm({
  accounts,
  categories = [],
  transaction,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const [accountId, setAccountId] = useState(transaction?.accountId ?? "")
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? "")
  const [amount, setAmount] = useState(transaction?.amount ?? "")
  const [description, setDescription] = useState(transaction?.description ?? "")
  const [transactionDate, setTransactionDate] = useState(
    dateValue(transaction?.transactionDate)
  )
  const [notes, setNotes] = useState(transaction?.notes ?? "")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const numericAmount = Number(amount)

    if (
      !accountId ||
      !description.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount === 0 ||
      !transactionDate
    ) {
      setError("Account, date, description and a non-zero amount are required.")
      return
    }

    try {
      await onSubmit({
        accountId,
        categoryId: categoryId || null,
        amount: numericAmount,
        description: description.trim(),
        transactionDate,
        notes: notes.trim() || null,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save transaction."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/30 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Account</span>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3"
            disabled={isSubmitting}
          >
            <option value="">Select account</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3"
            disabled={isSubmitting}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Amount</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="-500.00 or 500.00"
            className="h-10 w-full rounded-md border bg-background px-3"
            disabled={isSubmitting}
          />
        </label>

        <label className="space-y-1.5 text-sm">
          <span className="font-medium">Date</span>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3"
            disabled={isSubmitting}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Description</span>
        <input
          value={description}
          maxLength={255}
          onChange={(e) => setDescription(e.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3"
          disabled={isSubmitting}
        />
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          value={notes}
          maxLength={10000}
          rows={3}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2"
          disabled={isSubmitting}
        />
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : transaction
              ? "Save changes"
              : "Add transaction"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
