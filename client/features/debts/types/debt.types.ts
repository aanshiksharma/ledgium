export type DebtStatus = "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED"
export type Debt = { id: string; debtorId: string; creditorId: string; amount: string; currency: string; sourceType: "HOUSEHOLD" | "PERSONAL"; householdExpenseId: string | null; description: string; status: DebtStatus; dueDate: string | null; createdAt: string; updatedAt: string; debtor: { id: string; name: string; email: string; imageUrl: string | null }; creditor: { id: string; name: string; email: string; imageUrl: string | null }; settlements?: { id: string; amount: string; settledAt: string; createdBy: string; notes: string | null }[] }
export type DebtListResponse = { debts: Debt[]; total: number }
export type DebtResponse = { debt: Debt }
export type CreateSettlementInput = { amount: number; settledAt: string; notes?: string }
export type SettlementResponse = { settlement: { id: string; debtId: string; amount: string; settledAt: string; createdBy: string; notes: string | null; createdAt: string }; debt: Debt }
