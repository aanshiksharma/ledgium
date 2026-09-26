"use client"

import { useEffect, useMemo, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"

import { useAuth } from "@/features/auth"
import { useMembers } from "@/features/members"

import {
  useHouseholdExpenses,
  type HouseholdExpense,
  type HouseholdExpenseInput,
  type HouseholdExpenseFormProps,
  type HouseholdExpenseFormValues,
} from "@/features/household-expenses"
import {
  dateValue,
  distributeEqually,
  localDateValue,
  sumCents,
  toCents,
  getSplitMode,
} from "../utils/expense-split.utils"

function createDefaultFormValues(userId: string): HouseholdExpenseFormValues {
  return {
    description: "",
    categoryId: "",
    totalAmount: "",
    expenseDate: localDateValue(),
    participantIds: [],
    splitMode: "equal",
    customAmounts: {},
    payerId: userId,
  }
}

function createEditFormValues(
  expense: HouseholdExpense
): HouseholdExpenseFormValues {
  return {
    description: expense.description,
    categoryId: expense.categoryId ?? "",
    totalAmount: String(expense.totalAmount),
    expenseDate: dateValue(expense.expenseDate),
    participantIds: expense.participants.map(
      (participant) => participant.userId
    ),
    splitMode: getSplitMode(expense),
    customAmounts: Object.fromEntries(
      expense.participants.map((participant) => [
        participant.userId,
        String(participant.shareAmount),
      ])
    ),
    payerId: expense.payers[0]?.userId ?? "",
  }
}

export function useHouseholdExpenseForm({
  householdId,
  expense,
  onSuccess,
}: HouseholdExpenseFormProps) {
  const { user } = useAuth()
  const { members } = useMembers()
  const initializedExpenseIdRef = useRef<string | null>(null)

  const { update, create, refresh } = useHouseholdExpenses(householdId)

  const form = useForm<HouseholdExpenseFormValues>({
    defaultValues: createDefaultFormValues(user?.id ?? ""),
  })

  const { control, reset, setValue, setError, clearErrors } = form

  const participantIds = useWatch({
    control,
    name: "participantIds",
  })

  const splitMode = useWatch({
    control,
    name: "splitMode",
  })

  const totalAmount = useWatch({
    control,
    name: "totalAmount",
  })

  const customAmounts = useWatch({
    control,
    name: "customAmounts",
  })

  const payerId = useWatch({
    control,
    name: "payerId",
  })

  const categoryId = useWatch({
    control,
    name: "categoryId",
  })

  const hasRecordedSettlements = useMemo(
    () =>
      expense?.debts.some(
        (debt) => (debt._count?.settlementAllocations ?? 0) > 0
      ) ?? false,
    [initializedExpenseIdRef.current]
  )

  const financialFieldsLocked = Boolean(expense && hasRecordedSettlements)

  useEffect(() => {
    const expenseId = expense?.id ?? null

    if (initializedExpenseIdRef.current === expenseId) return

    initializedExpenseIdRef.current = expenseId

    reset(
      expense
        ? createEditFormValues(expense)
        : createDefaultFormValues(user?.id ?? "")
    )
  }, [expense, reset])

  useEffect(() => {
    if (
      financialFieldsLocked ||
      splitMode !== "equal" ||
      participantIds.length === 0
    )
      return

    setValue(
      "customAmounts",
      distributeEqually(toCents(totalAmount), participantIds)
    )
  }, [financialFieldsLocked, setValue, participantIds, splitMode, totalAmount])

  const totalCents = toCents(totalAmount)
  const obligedCents = sumCents(customAmounts, participantIds)
  const differenceCents = obligedCents - totalCents
  const distributionBalanced =
    participantIds.length > 0 && differenceCents === 0

  const submit = form.handleSubmit(async (formValues) => {
    clearErrors("root")

    const description = formValues.description.trim()
    const amount = Number(formValues.totalAmount)
    const amountCents = toCents(formValues.totalAmount)

    if (!description) {
      setError("description", { message: "Expense name is required." })
      return
    }

    if (!formValues.categoryId) {
      setError("categoryId", { message: "Category is required." })
      return
    }

    if (!Number.isFinite(amount)) {
      setError("totalAmount", { message: "Enter a valid amount." })
      return
    }

    if (amountCents <= 0) {
      setError("totalAmount", { message: "Amount must be greater than 0." })
      return
    }

    if (amountCents > 100_000_000) {
      setError("totalAmount", {
        message: "Amount cannot exceed 1,000,000.00.",
      })
      return
    }

    if (!formValues.expenseDate) {
      setError("expenseDate", { message: "Expense date is required." })
      return
    }

    if (!formValues.payerId) {
      setError("payerId", { message: "Payer is required." })
      return
    }

    if (formValues.participantIds.length === 0) {
      setError("participantIds", {
        message: "Select at least one participant.",
      })
      return
    }

    if (!distributionBalanced) {
      setError("root", {
        message: "Participant obligations must equal the total amount.",
      })
      return
    }

    const input: HouseholdExpenseInput = {
      description,
      categoryId: formValues.categoryId,
      totalAmount: amountCents / 100,
      expenseDate: formValues.expenseDate,
      payers: [
        {
          userId: formValues.payerId,
          paidAmount: amountCents / 100,
        },
      ],
      participants: formValues.participantIds.map((userId) => ({
        userId,
        shareAmount: toCents(formValues.customAmounts[userId] ?? "0") / 100,
      })),
    }

    try {
      if (expense) await update(expense.id, input)
      else await create(input)

      await refresh()
      onSuccess?.()
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : "Unexpected error occurred while saving"
      )
    }
  })

  return {
    form,
    members,
    values: {
      totalAmount,
      splitMode,
      participantIds,
      customAmounts,
      payerId,
      categoryId,
    },
    totalCents,
    differenceCents,
    distributionBalanced,
    financialFieldsLocked,
    hasRecordedSettlements,
    submit,
  }
}
