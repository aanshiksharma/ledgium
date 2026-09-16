import type { Dashboard } from "../types/dashboard.types"
type Props = { sharedExpenses: Dashboard["sharedExpenses"]; householdDebts: Dashboard["householdDebts"] }
const money = (v: string, c: string) => new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2 }).format(Number(v))
export function HouseholdOverview({ sharedExpenses, householdDebts }: Props) {
  return <section className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Shared expenses</p><p className="mt-2 text-2xl font-semibold tracking-tight">{money(sharedExpenses.total, sharedExpenses.currency)}</p><p className="mt-1 text-xs text-muted-foreground">{sharedExpenses.count} recorded in the selected period</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-muted-foreground">Outstanding household debt</p><p className="mt-2 text-2xl font-semibold tracking-tight">{money(householdDebts.outstandingTotal, householdDebts.currency)}</p><p className="mt-1 text-xs text-muted-foreground">{householdDebts.openCount} open obligations</p></div></section>
}
