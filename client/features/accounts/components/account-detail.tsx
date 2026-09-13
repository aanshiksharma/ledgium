"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"
import { AccountForm } from "./account-form"
import { useAccount } from "../hooks/use-accounts"
import {
  archiveAccount,
  restoreAccount,
  updateAccount,
} from "../api/account-api"
import type { UpdateAccountInput } from "../types/account.types"

type AccountDetailProps = {
  accountId: string
}

export function AccountDetail({ accountId }: AccountDetailProps) {
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const { account, setAccount, isLoading, error, refresh } = useAccount(
    currentHousehold?.id ?? null,
    accountId
  )
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingState, setIsUpdatingState] = useState(false)

  if (isHouseholdLoading || isLoading) {
    return <p className="text-sm text-muted-foreground">Loading account...</p>
  }

  if (!currentHousehold) {
    return (
      <p className="text-sm text-muted-foreground">No household selected.</p>
    )
  }

  if (error || !account) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          {error ?? "Account not found."}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
          <Button asChild variant="ghost">
            <Link href="/accounts">Back to accounts</Link>
          </Button>
        </div>
      </div>
    )
  }

  async function handleUpdate(input: UpdateAccountInput) {
    setIsSubmitting(true)
    try {
      if (!currentHousehold || !account) return

      const updated = await updateAccount(
        currentHousehold.id,
        account.id,
        input
      )
      setAccount(updated)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSetActive() {
    setIsUpdatingState(true)
    try {
      if (!currentHousehold || !account) return

      const updated = account.isActive
        ? await archiveAccount(currentHousehold.id, account.id)
        : await restoreAccount(currentHousehold.id, account.id)
      setAccount(updated)
    } finally {
      setIsUpdatingState(false)
    }
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/accounts"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to accounts
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {account.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {account.type.replace("_", " ")} · {account.currency}
          </p>
        </div>
        <span className="rounded-full border px-2.5 py-1 text-xs">
          {account.isActive ? "Active" : "Archived"}
        </span>
      </div>

      {isEditing ? (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit account</h2>
          <AccountForm
            account={account}
            currency={currentHousehold.currency}
            isSubmitting={isSubmitting}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-6">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Opening balance</dt>
              <dd className="mt-1 font-medium">
                {account.currency} {account.openingBalance}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Transactions</dt>
              <dd className="mt-1 font-medium">
                {account._count.transactions}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">
                {new Date(account.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last updated</dt>
              <dd className="mt-1 text-sm">
                {new Date(account.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button
              variant={account.isActive ? "destructive" : "outline"}
              disabled={isUpdatingState}
              onClick={() => void handleSetActive()}
            >
              {isUpdatingState
                ? "Updating..."
                : account.isActive
                  ? "Archive account"
                  : "Restore account"}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
