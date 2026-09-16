"use client"
import { useCallback, useEffect, useState } from "react"
import { getDebts, settleDebt } from "../api/debt-api"
import type { CreateSettlementInput, Debt } from "../types/debt.types"
export function useDebts(householdId: string | null) {
  const [debts, setDebts] = useState<Debt[]>([]); const [total, setTotal] = useState(0); const [isLoading, setIsLoading] = useState(false); const [isSubmitting, setIsSubmitting] = useState(false); const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(async () => { if (!householdId) { setDebts([]); setTotal(0); return }; setIsLoading(true); setError(null); try { const r = await getDebts(householdId); setDebts(r.debts); setTotal(r.total) } catch (e) { setDebts([]); setTotal(0); setError(e instanceof Error ? e.message : "Failed to load debts.") } finally { setIsLoading(false) } }, [householdId])
  useEffect(() => { void refresh() }, [refresh])
  const settle = useCallback(async (debtId: string, input: CreateSettlementInput) => { if (!householdId) return; setIsSubmitting(true); setError(null); try { await settleDebt(householdId, debtId, input); await refresh() } catch (e) { const message = e instanceof Error ? e.message : "Failed to record settlement."; setError(message); throw e } finally { setIsSubmitting(false) } }, [householdId, refresh])
  return { debts, total, isLoading, isSubmitting, error, refresh, settle }
}
