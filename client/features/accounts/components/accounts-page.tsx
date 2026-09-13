"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"
import { AccountCard } from "./account-card"
import { AccountForm } from "./account-form"
import { useAccounts } from "../hooks/use-accounts"

export function AccountsPage() {
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const { accounts, isLoading, error, refresh, create, setActive } =
    useAccounts(currentHousehold?.id ?? null)

  const [isCreating, setIsCreating] = useState(false)
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null)

  if (isHouseholdLoading) {
    return <p className="text-sm text-muted-foreground">Loading household...</p>
  }

  if (!currentHousehold) {
    return (
      <div className="rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">No household selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select or create a household before managing accounts.
        </p>
      </div>
    )
  }

  async function handleCreate(input: Parameters<typeof create>[0]) {
    await create(input)
    setIsCreating(false)
  }

  async function handleSetActive(accountId: string, active: boolean) {
    setUpdatingAccountId(accountId)
    try {
      await setActive(accountId, active)
    } finally {
      setUpdatingAccountId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the financial accounts belonging to {currentHousehold.name}.
          </p>
        </div>
        {!isCreating && <Button onClick={() => setIsCreating(true)}>Add account</Button>}
      </div>

      {isCreating && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Create account</h2>
          <AccountForm
            currency={currentHousehold.currency}
            isSubmitting={false}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>Retry</Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <h2 className="font-medium">No accounts yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first account to start recording household finances.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isUpdating={updatingAccountId === account.id}
              onSetActive={(active) => handleSetActive(account.id, active)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
