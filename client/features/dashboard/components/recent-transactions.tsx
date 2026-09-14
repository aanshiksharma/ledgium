import Link from "next/link"
import type { DashboardTransaction } from "../types/dashboard.types"

type Props = {
  transactions: DashboardTransaction[]
  currency: string
}

const money = (v: string, c: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(Number(v))

export function RecentTransactions({ transactions, currency }: Props) {
  return (
    <section className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm hover:underline">
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No transactions for this period.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                {["Date", "Description", "Account", "Category", "Amount"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    {new Date(t.transactionDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/transactions/${t.id}`}
                      className="font-medium hover:underline"
                    >
                      {t.description}
                    </Link>
                    {t.transferId ? (
                      <div className="text-xs text-muted-foreground">
                        Transfer
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{t.account.name}</td>
                  <td className="px-4 py-3">{t.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {money(t.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
