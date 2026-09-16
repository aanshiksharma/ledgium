import type { DashboardPeriodActivity } from "../types/dashboard.types"

type Props = {
  totalBalance: string
  periodActivity: DashboardPeriodActivity
  currency: string
}

const money = (v: string, c: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(Number(v))

export function DashboardSummary({
  totalBalance,
  periodActivity,
  currency,
}: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Total Balance", totalBalance],
        ["Inflow", periodActivity.inflow],
        ["Outflow", periodActivity.outflow],
        ["Net Change", periodActivity.netChange],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border p-5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {money(value, currency)}
          </p>
        </div>
      ))}
    </section>
  )
}
