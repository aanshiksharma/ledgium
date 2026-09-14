import Link from "next/link"
import type { DashboardAccount } from "../types/dashboard.types"

type Props = {
  accounts: DashboardAccount[]
}

const money = (v: string, c: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(Number(v))

export function AccountBalances({ accounts }: Props) {
  return (
    <section className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Account Balances</h2>
        <Link href="/accounts" className="text-sm hover:underline">
          View accounts
        </Link>
      </div>

      {accounts.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No active accounts yet.
        </p>
      ) : (
        <div className="mt-4 divide-y">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.type.replace("_", " ")}
                </p>
              </div>
              <p className="font-medium">{money(a.balance, a.currency)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
