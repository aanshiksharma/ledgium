"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useCategories } from "@/features/categories"
import { useMembers } from "@/features/members"
import { useAuth } from "@/providers/auth-provider"

import type {
  HouseholdExpense,
  HouseholdExpenseInput,
} from "../types/household-expense.types"

type SplitMode = "equal" | "custom"

type Props = {
  householdId: string
  currency: string
  expense?: HouseholdExpense | null
  isSubmitting: boolean
  onSubmit: (input: HouseholdExpenseInput) => Promise<void>
  onCancel?: () => void
}

function localDateValue() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function dateValue(value?: string) {
  return value ? value.slice(0, 10) : localDateValue()
}

function toCents(value: string | number) {
  const numeric = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.round(numeric * 100)
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2)
}

function distributeEqually(totalCents: number, memberIds: string[]) {
  if (!memberIds.length) return {}

  const base = Math.floor(totalCents / memberIds.length)
  const remainder = totalCents - base * memberIds.length

  return Object.fromEntries(
    memberIds.map((memberId, index) => [
      memberId,
      formatAmount(base + (index === memberIds.length - 1 ? remainder : 0)),
    ])
  )
}

function sumCents(values: Record<string, string>, memberIds: string[]) {
  return memberIds.reduce((sum, memberId) => {
    const cents = toCents(values[memberId] ?? "")
    return cents === null ? sum : sum + cents
  }, 0)
}

function money(value: string | number, currency: string) {
  const numeric = typeof value === "number" ? value : Number(value)
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(numeric)
}

export function HouseholdExpenseForm({
  householdId,
  currency,
  expense = null,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const { user } = useAuth()
  const { members, isLoading: membersLoading } = useMembers(householdId)
  const { categories, isLoading: categoriesLoading } = useCategories(householdId)

  const [description, setDescription] = useState(expense?.description ?? "")
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "")
  const [totalAmount, setTotalAmount] = useState(expense?.totalAmount ?? "")
  const [expenseDate, setExpenseDate] = useState(
    dateValue(expense?.expenseDate)
  )

  const existingParticipantIds =
    expense?.participants.map((participant) => participant.userId) ?? []

  const [participantIds, setParticipantIds] = useState<string[]>(
    existingParticipantIds
  )

  const [splitMode, setSplitMode] = useState<SplitMode>(() =>
    expense?.participants.length &&
    expense.participants.some(
      (participant) => participant.sharePercentage !== null
    )
      ? "custom"
      : "equal"
  )

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    () => {
      if (!expense) return {}
      return Object.fromEntries(
        expense.participants.map((participant) => [
          participant.userId,
          Number(participant.shareAmount).toFixed(2),
        ])
      )
    }
  )

  const [payerId, setPayerId] = useState(
    expense?.payers[0]?.userId ?? user?.id ?? ""
  )
  const [showPayerSelector, setShowPayerSelector] = useState(
    Boolean(expense?.payers[0]?.userId && expense.payers[0].userId !== user?.id)
  )
  const [error, setError] = useState<string | null>(null)

  const hasRecordedSettlements = useMemo(
    () => expense?.debts.some((debt) => (debt._count?.settlements ?? 0) > 0) ?? false,
    [expense]
  )

  const financialFieldsLocked = Boolean(expense && hasRecordedSettlements)

  useEffect(() => {
    if (!expense && members.length && participantIds.length === 0) {
      setParticipantIds(members.map((member) => member.userId))
    }
  }, [expense, members, participantIds.length])

  useEffect(() => {
    if (!expense && user?.id && !payerId) {
      setPayerId(user.id)
    }
  }, [expense, payerId, user?.id])

  useEffect(() => {
    const ids = participantIds
    const totalCents = toCents(totalAmount)

    if (splitMode !== "equal" || totalCents === null || totalCents <= 0) {
      return
    }

    setCustomAmounts(distributeEqually(totalCents, ids))
  }, [participantIds, splitMode, totalAmount])

  useEffect(() => {
    if (!expense) return

    setDescription(expense.description)
    setCategoryId(expense.categoryId ?? "")
    setTotalAmount(expense.totalAmount)
    setExpenseDate(dateValue(expense.expenseDate))
    setParticipantIds(expense.participants.map((participant) => participant.userId))
    setCustomAmounts(
      Object.fromEntries(
        expense.participants.map((participant) => [
          participant.userId,
          Number(participant.shareAmount).toFixed(2),
        ])
      )
    )
    setPayerId(expense.payers[0]?.userId ?? user?.id ?? "")
    setShowPayerSelector(
      Boolean(expense.payers[0]?.userId && expense.payers[0].userId !== user?.id)
    )
  }, [expense, user?.id])

  const participantMembers = useMemo(
    () =>
      members.filter((member) => participantIds.includes(member.userId)),
    [members, participantIds]
  )

  const totalCents = toCents(totalAmount) ?? 0
  const obligedCents = sumCents(customAmounts, participantIds)
  const distributionBalanced =
    participantIds.length > 0 && totalCents > 0 && obligedCents === totalCents

  const differenceCents = obligedCents - totalCents

  function toggleParticipant(userId: string) {
    if (financialFieldsLocked) return

    setParticipantIds((current) => {
      if (current.includes(userId)) {
        setCustomAmounts((amounts) => {
          const next = { ...amounts }
          delete next[userId]
          return next
        })
        return current.filter((id) => id !== userId)
      }

      const nextIds = [...current, userId]

      if (splitMode === "equal") {
        const cents = toCents(totalAmount)
        if (cents !== null && cents > 0) {
          setCustomAmounts(distributeEqually(cents, nextIds))
        }
      }

      return nextIds
    })
  }

  function changeCustomAmount(userId: string, value: string) {
    if (financialFieldsLocked) return
    setCustomAmounts((current) => ({
      ...current,
      [userId]: value,
    }))
  }

  function handleSplitModeChange(mode: SplitMode) {
    if (financialFieldsLocked) return
    setSplitMode(mode)

    if (mode === "equal") {
      const cents = toCents(totalAmount)
      if (cents !== null && cents > 0) {
        setCustomAmounts(distributeEqually(cents, participantIds))
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const amountCents = toCents(totalAmount)

    if (
      !description.trim() ||
      !categoryId ||
      amountCents === null ||
      amountCents <= 0 ||
      !expenseDate ||
      !payerId ||
      participantIds.length === 0
    ) {
      setError(
        "Expense name, category, total amount, payer, participants, and date are required."
      )
      return
    }

    if (!distributionBalanced) {
      setError(
        "The participant distribution must equal the total expense amount."
      )
      return
    }

    const participants = participantMembers.map((member) => {
      const amount = Number(customAmounts[member.userId] ?? "0")

      return {
        userId: member.userId,
        shareAmount: amount,
      }
    })

    try {
      await onSubmit({
        description: description.trim(),
        categoryId,
        totalAmount: amountCents / 100,
        expenseDate,
        payers: [{ userId: payerId, paidAmount: amountCents / 100 }],
        participants,
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to save shared expense."
      )
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {financialFieldsLocked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <p className="font-medium">Financial distribution is locked</p>
          <p className="mt-1 text-muted-foreground">
            This expense has recorded settlements. Its total, payer,
            participants, and split cannot be changed because doing so would
            invalidate existing debt history.
          </p>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl border border-destructive/30 p-3 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Expense details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span>Expense Name</span>
            <input
              value={description}
              maxLength={255}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Zepto order"
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl border bg-background px-3 font-normal"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium">
            <span>Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={
                isSubmitting ||
                categoriesLoading ||
                !categories.length
              }
              className="h-10 w-full rounded-xl border bg-background px-3 font-normal"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block max-w-md space-y-1.5 text-sm font-medium">
          <span>Total amount</span>
          <div className="flex h-10 overflow-hidden rounded-xl border bg-background">
            <span className="flex items-center border-r px-3 text-sm text-muted-foreground">
              {currency}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={totalAmount}
              onChange={(event) => setTotalAmount(event.target.value)}
              placeholder="0.00"
              disabled={isSubmitting || financialFieldsLocked}
              className="min-w-0 flex-1 bg-transparent px-3 outline-none"
            />
          </div>
        </label>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Participants</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone is selected by default. Remove anyone who has no
            obligation toward this expense.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {members.map((member) => {
            const selected = participantIds.includes(member.userId)

            return (
              <label
                key={member.userId}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                  selected ? "bg-muted/40" : "opacity-70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleParticipant(member.userId)}
                  disabled={
                    isSubmitting ||
                    membersLoading ||
                    financialFieldsLocked
                  }
                />
                <span>{member.user.name}</span>
              </label>
            )
          })}
        </div>

        {!membersLoading && members.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No household members are available.
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Split</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Decide how much each participant is obliged to pay.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
            <input
              type="radio"
              name="split-mode"
              checked={splitMode === "equal"}
              onChange={() => handleSplitModeChange("equal")}
              disabled={isSubmitting || financialFieldsLocked}
            />
            <span>
              <span className="block text-sm font-medium">
                Equal distribution
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Divide the total equally among participants.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3">
            <input
              type="radio"
              name="split-mode"
              checked={splitMode === "custom"}
              onChange={() => handleSplitModeChange("custom")}
              disabled={isSubmitting || financialFieldsLocked}
            />
            <span>
              <span className="block text-sm font-medium">
                Custom distribution
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Set the exact obligation for each participant.
              </span>
            </span>
          </label>
        </div>

        <div className="overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1fr_10rem] border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Member</span>
            <span className="text-right">Amount obliged</span>
          </div>

          {participantMembers.map((member) => (
            <div
              key={member.userId}
              className="grid grid-cols-[1fr_10rem] items-center border-b px-4 py-3 last:border-b-0"
            >
              <span className="text-sm">{member.user.name}</span>
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={customAmounts[member.userId] ?? ""}
                  onChange={(event) =>
                    changeCustomAmount(member.userId, event.target.value)
                  }
                  disabled={
                    isSubmitting ||
                    splitMode === "equal" ||
                    financialFieldsLocked
                  }
                  className="h-9 w-32 rounded-lg border bg-background px-2 text-right text-sm disabled:opacity-60"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-sm">
            <span className="font-medium">Total obliged</span>
            <span className="font-semibold">
              {money(obligedCents / 100, currency)}
            </span>
          </div>
        </div>

        <div
          className={`rounded-xl border p-3 text-sm ${
            distributionBalanced
              ? "border-primary/30 bg-primary/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span>
              {distributionBalanced
                ? "Distribution balanced"
                : differenceCents < 0
                  ? "Amount still to distribute"
                  : "Distribution exceeds total"}
            </span>
            <strong>
              {money(Math.abs(differenceCents) / 100, currency)}
            </strong>
          </div>

          {!distributionBalanced && (
            <p className="mt-1 text-xs text-muted-foreground">
              The expense cannot be recorded until the participant obligations
              equal the total amount.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Payment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The person recording the expense is assumed to have paid.
            </p>
          </div>

          <div className="text-right text-sm">
            <p>
              Paid by{" "}
              <span className="font-medium">
                {members.find((member) => member.userId === payerId)?.user.name ??
                  "You"}
              </span>
            </p>

            <button
              type="button"
              className="mt-1 text-xs underline underline-offset-4"
              onClick={() => setShowPayerSelector((current) => !current)}
              disabled={isSubmitting || financialFieldsLocked}
            >
              {showPayerSelector ? "Use me" : "Change"}
            </button>
          </div>
        </div>

        {showPayerSelector && (
          <select
            value={payerId}
            onChange={(event) => setPayerId(event.target.value)}
            disabled={isSubmitting || membersLoading || financialFieldsLocked}
            className="h-10 w-full rounded-xl border bg-background px-3"
          >
            <option value="">Select member who paid</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.name}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Expense date</h2>
        <input
          type="date"
          value={expenseDate}
          onChange={(event) => setExpenseDate(event.target.value)}
          disabled={isSubmitting}
          className="h-10 w-full max-w-md rounded-xl border bg-background px-3"
        />
      </section>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            membersLoading ||
            categoriesLoading ||
            !distributionBalanced ||
            financialFieldsLocked
          }
        >
          {isSubmitting
            ? "Saving..."
            : expense
              ? "Save changes"
              : "Record expense"}
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
