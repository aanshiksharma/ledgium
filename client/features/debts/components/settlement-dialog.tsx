"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { DebtBalance } from "../types/debt.types"

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function money(value: string | number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

type Props = {
  balance: DebtBalance | null
  currentUserId: string | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (input: {
    debtorId: string
    creditorId: string
    amount: number
    settledAt: string
    notes?: string
  }) => Promise<void>
}

export function SettlementDialog({
  balance,
  currentUserId,
  isSubmitting,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState("")
  const [settledAt, setSettledAt] = useState(localDate())
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (balance) {
      setAmount(balance.outstandingAmount)
      setSettledAt(localDate())
      setNotes("")
    }
  }, [balance])

  if (!balance) return null

  const isDebtor = balance.debtor.id === currentUserId
  const isCreditor = balance.creditor.id === currentUserId
  const canSettle = isDebtor || isCreditor
  const numericAmount = Number(amount)
  const validAmount =
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    numericAmount <= Number(balance.outstandingAmount)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!balance || !canSettle || !validAmount) return
    await onSubmit({
      debtorId: balance.debtor.id,
      creditorId: balance.creditor.id,
      amount: numericAmount,
      settledAt,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settlement-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="settlement-dialog-title" className="text-lg font-semibold">
              Record settlement
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {balance.debtor.name} owes {balance.creditor.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="mt-1 text-2xl font-semibold">
            {money(balance.outstandingAmount, balance.currency)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {isDebtor ? "You are the borrower." : "You are the lender."} You can
            record a payment between these two members.
          </p>
        </div>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Amount to settle</span>
            <input
              type="number"
              min="0.01"
              max={balance.outstandingAmount}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              autoFocus
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Settlement date</span>
            <input
              type="date"
              value={settledAt}
              onChange={(event) => setSettledAt(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              Notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="e.g. Paid by UPI"
            />
          </label>

          {!validAmount && amount && (
            <p className="text-sm text-destructive">
              Enter an amount between ₹0.01 and{" "}
              {money(balance.outstandingAmount, balance.currency)}.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !validAmount}>
              {isSubmitting
                ? "Recording..."
                : `Settle ${validAmount ? money(numericAmount, balance.currency) : ""}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
