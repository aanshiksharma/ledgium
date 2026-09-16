"use client"
import { Button } from "@/components/ui/button"
import { useHousehold } from "@/features/households"
import { useDebts } from "../hooks/use-debts"
import { DebtList } from "./debt-list"
export function DebtsPage() {
  const { currentHousehold, isLoading: householdLoading } = useHousehold(); const { debts, isLoading, isSubmitting, error, refresh, settle } = useDebts(currentHousehold?.id ?? null)
  if (householdLoading) return <p className="text-sm text-muted-foreground">Loading household...</p>
  if (!currentHousehold) return <div className="rounded-2xl border p-6"><h2 className="font-semibold">No household selected</h2><p className="mt-1 text-sm text-muted-foreground">Select or create a household before managing debts.</p></div>
  async function handleSettle(id: string, amount: number) { if (!Number.isFinite(amount) || amount <= 0) return; await settle(id, { amount, settledAt: new Date().toISOString().slice(0, 10) }) }
  return <section className="space-y-6"><div className="flex items-end justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">Household debts</h1><p className="mt-1 text-sm text-muted-foreground">Track outstanding obligations created from shared expenses.</p></div><Button variant="outline" onClick={() => void refresh()} disabled={isLoading}>Refresh</Button></div>{error && <p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p>}<DebtList debts={debts} isLoading={isLoading} isSubmitting={isSubmitting} onSettle={handleSettle} /></section>
}
