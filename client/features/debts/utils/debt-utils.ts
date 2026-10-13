import {
  Allocation,
  CreateSettlementInput,
  DebtBalance,
} from "@/features/debts"

import { localDate } from "@/lib/utils"

export function createSettlementInput(
  balance: DebtBalance,
  allocations: Allocation[],
  notes?: string
): CreateSettlementInput {
  return {
    debtorId: balance.debtor.id,
    creditorId: balance.creditor.id,
    allocations,
    settledAt: localDate(),
    notes,
  }
}
