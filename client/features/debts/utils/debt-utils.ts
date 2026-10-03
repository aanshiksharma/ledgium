import { Allocation, DebtBalance } from "../types/debt.types"

export function createSettlementInput(
  balance: DebtBalance,
  allocations: Allocation[]
) {
  return {
    debtorId: balance.debtor.id,
    creditorId: balance.creditor.id,
    allocations,
    settledAt: localDate(),
  }
}

export function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

export function date(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
