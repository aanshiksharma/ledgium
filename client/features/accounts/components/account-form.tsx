'use client'

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { Account, AccountType, CreateAccountInput } from "../types/account.types"

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "OTHER", label: "Other" },
]

type AccountFormProps = {
  account?: Account
  currency: string
  isSubmitting: boolean
  onSubmit: (input: CreateAccountInput) => Promise<void>
  onCancel?: () => void
}

export function AccountForm({
  account,
  currency,
  isSubmitting,
  onSubmit,
  onCancel,
}: AccountFormProps) {
  const [name, setName] = useState(account?.name ?? "")
  const [type, setType] = useState<AccountType>(account?.type ?? "BANK")
  const [openingBalance, setOpeningBalance] = useState(account?.openingBalance ?? "0")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(account?.name ?? "")
    setType(account?.type ?? "BANK")
    setOpeningBalance(account?.openingBalance ?? "0")
    setError(null)
  }, [account])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedBalance = Number(openingBalance)

    if (!name.trim()) {
      setError("Account name is required.")
      return
    }

    if (!Number.isFinite(parsedBalance)) {
      setError("Opening balance must be a valid number.")
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        type,
        openingBalance: parsedBalance,
        currency,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to save account."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="account-name" className="text-sm font-medium">Name</label>
        <input
          id="account-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Main Bank Account"
          disabled={isSubmitting}
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="account-type" className="text-sm font-medium">Type</label>
        <select
          id="account-type"
          value={type}
          onChange={(event) => setType(event.target.value as AccountType)}
          disabled={isSubmitting}
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {ACCOUNT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="opening-balance" className="text-sm font-medium">
          Opening balance
        </label>
        <input
          id="opening-balance"
          type="number"
          step="0.01"
          value={openingBalance}
          onChange={(event) => setOpeningBalance(event.target.value)}
          disabled={isSubmitting || Boolean(account?._count.transactions)}
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        />
        {Boolean(account?._count.transactions) && (
          <p className="text-xs text-muted-foreground">
            Opening balance cannot be changed after transactions exist.
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Currency: {currency}. Account currency is controlled by the household.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : account ? "Save changes" : "Create account"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
