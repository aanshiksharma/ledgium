import Link from "next/link"
import type { DashboardCategoryTotal } from "../types/dashboard.types"

type Props = { categoryTotals: DashboardCategoryTotal[]; currency: string }

const money = (v: string, c: string) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: c,
    minimumFractionDigits: 2,
  }).format(Number(v))

export function CategoryBreakdown({ categoryTotals, currency }: Props) {
  const items = [...categoryTotals].sort(
    (a, b) => Math.abs(Number(b.amount)) - Math.abs(Number(a.amount))
  )

  return (
    <section className="rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Category Breakdown</h2>
        <Link href="/categories" className="text-sm hover:underline">
          View categories
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No category activity for this period.
        </p>
      ) : (
        <div className="mt-4 divide-y">
          {items.map((i) => (
            <div
              key={i.category?.id ?? "uncategorized"}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {i.category?.color ? (
                  <span
                    aria-hidden="true"
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: i.category.color }}
                  />
                ) : null}

                <p className="truncate font-medium">
                  {i.category?.name ?? "Uncategorized"}
                </p>
              </div>

              <p className="shrink-0 font-medium">
                {money(i.amount, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
