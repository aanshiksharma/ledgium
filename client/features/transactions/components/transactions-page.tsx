"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"
import { useAccounts } from "@/features/accounts"
import { useTransactions } from "../hooks/use-transactions"
import { TransactionForm } from "./transaction-form"
import { TransferForm } from "./transfer-form"
import { TransactionList } from "./transaction-list"

export function TransactionsPage() {
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const { accounts } = useAccounts(currentHousehold?.id ?? null)

  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [offset, setOffset] = useState(0)
  const [mode, setMode] = useState<"transaction" | "transfer" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null)
  const [deletingTransferId, setDeletingTransferId] = useState<string | null>(
    null
  )

  const filters = useMemo(
    () => ({
      accountId: accountId || undefined,
      categoryId: categoryId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: 50,
      offset,
    }),
    [accountId, categoryId, from, to, offset]
  )

  const {
    transactions,
    total,
    isLoading,
    error,
    refresh,
    create,
    transfer,
    remove,
    removeTransfer,
  } = useTransactions(currentHousehold?.id ?? null, filters)

  if (isHouseholdLoading) {
    return <p className="text-sm text-muted-foreground">Loading household...</p>
  }

  if (!currentHousehold) {
    return (
      <div className="rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">No household selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select or create a household before managing transactions.
        </p>
      </div>
    )
  }

  async function handleCreate(input: Parameters<typeof create>[0]) {
    setIsSubmitting(true)
    try {
      await create(input)
      setMode(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleTransfer(input: Parameters<typeof transfer>[0]) {
    setIsSubmitting(true)
    try {
      await transfer(input)
      setMode(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(transactionId: string) {
    setDeletingTransactionId(transactionId)

    try {
      await remove(transactionId)
    } finally {
      setDeletingTransactionId(null)
    }
  }

  async function handleDeleteTransfer(transferId: string) {
    setDeletingTransferId(transferId)

    try {
      await removeTransfer(transferId)
    } finally {
      setDeletingTransferId(null)
    }
  }

  const activeAccounts = accounts
    .filter((account) => account.isActive)
    .map((account) => ({
      id: account.id,
      name: account.name,
      currency: account.currency,
    }))

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record and manage household financial activity.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode("transfer")}>
            Add transfer
          </Button>
          <Button onClick={() => setMode("transaction")}>
            Add transaction
          </Button>
        </div>
      </div>

      {mode === "transaction" && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Create transaction</h2>
          <TransactionForm
            accounts={activeAccounts}
            isSubmitting={isSubmitting}
            onSubmit={async (input) => handleCreate(input)}
            onCancel={() => setMode(null)}
          />
        </div>
      )}

      {mode === "transfer" && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Create transfer</h2>
          <TransferForm
            accounts={activeAccounts}
            isSubmitting={isSubmitting}
            onSubmit={handleTransfer}
            onCancel={() => setMode(null)}
          />
        </div>
      )}

      <div className="rounded-2xl border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value)
              setOffset(0)
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setOffset(0)
            }}
            placeholder="Category ID"
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />

          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setOffset(0)
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setOffset(0)
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}

      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        onDelete={handleDelete}
        onDeleteTransfer={handleDeleteTransfer}
        deletingTransactionId={deletingTransactionId}
        deletingTransferId={deletingTransferId}
      />

      {total > 50 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={offset === 0 || isLoading}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + 50, total)} of {total}
          </span>
          <Button
            variant="outline"
            disabled={offset + 50 >= total || isLoading}
            onClick={() => setOffset(offset + 50)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}
