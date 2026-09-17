import type { Dashboard } from "../types/dashboard.types"

type Props = {
  sharedExpenses: Dashboard["sharedExpenses"]
  householdDebts: Dashboard["householdDebts"]
}

const money = (v: string, c: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(Number(v))

export function HouseholdOverview({ sharedExpenses, householdDebts }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">Shared expenses</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {money(sharedExpenses.total, sharedExpenses.currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {sharedExpenses.count} recorded in the selected period
        </p>
      </div>

      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">You owe</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
          {money(householdDebts.amountOwed, householdDebts.currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your outstanding obligations
        </p>
      </div>

      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">You are owed</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
          {money(householdDebts.amountReceivable, householdDebts.currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Outstanding amounts owed to you
        </p>
      </div>
    </section>
  )
}
