"use client"

import { SubmitEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import type { CreateTransferInput } from "../types/transaction.types"

type Props = {
  accounts: { id: string; name: string; currency: string }[]
  isSubmitting: boolean
  onSubmit: (input: CreateTransferInput) => Promise<void>
  onCancel?: () => void
}

export function TransferForm({
  accounts,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const [fromAccountId, setFromAccountId] = useState("")
  const [toAccountId, setToAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const numericAmount = Number(amount)
    if (
      !fromAccountId ||
      !toAccountId ||
      fromAccountId === toAccountId ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !transactionDate
    ) {
      setError("Select different accounts and enter a positive amount.")
      return
    }

    try {
      await onSubmit({
        fromAccountId,
        toAccountId,
        amount: numericAmount,
        description: description.trim() || undefined,
        transactionDate,
        notes: notes.trim() || null,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create transfer."
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
          <span className="font-medium">From account</span>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
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
          <span className="font-medium">To account</span>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
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
          <span className="font-medium">Amount</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
          {isSubmitting ? "Saving..." : "Create transfer"}
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
