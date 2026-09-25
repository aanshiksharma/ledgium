import type { HouseholdExpense, SplitMode } from "@/features/household-expenses"

export function localDateValue(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function dateValue(value?: string): string {
  return value ? value.slice(0, 10) : localDateValue()
}

export function toCents(value: string | number): number {
  const amount = typeof value === "number" ? value : Number(value)
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

export function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function distributeEqually(
  totalCents: number,
  memberIds: string[]
): Record<string, string> {
  if (memberIds.length === 0) return {}

  const base = Math.floor(totalCents / memberIds.length)
  const remainder = totalCents - base * memberIds.length

  return Object.fromEntries(
    memberIds.map((id, index) => [
      id,
      formatAmount(base + (index < remainder ? 1 : 0)),
    ])
  )
}

export function sumCents(
  values: Record<string, string>,
  memberIds: string[]
): number {
  return memberIds.reduce((sum, id) => sum + toCents(values[id] ?? "0"), 0)
}

export function getSplitMode(expense: HouseholdExpense): SplitMode {
  const splits = expense.participants.map(
    (participant) => participant.shareAmount
  )

  const totalAmount = splits.reduce((total, split) => total + toCents(split), 0)
  const totalParticipants = expense.participants.length
  const equalShare = totalAmount / totalParticipants

  const equal = splits.every((split) => toCents(split) === equalShare) ?? false

  return equal ? "equal" : "custom"
}
