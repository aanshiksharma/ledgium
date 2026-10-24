import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Ellipsis,
  ReceiptText,
  UsersRound,
} from "lucide-react"

const expenses = [
  { title: "Groceries", category: "Food & essentials", amount: "₹1,200", initials: "GR", tone: "bg-amber-100 text-amber-800" },
  { title: "Electricity bill", category: "Utilities", amount: "₹850", initials: "EL", tone: "bg-sky-100 text-sky-800" },
  { title: "Household supplies", category: "Home", amount: "₹650", initials: "HS", tone: "bg-violet-100 text-violet-800" },
]

const balances = [
  { name: "Rahul", note: "owes you", amount: "₹450", direction: "in" },
  { name: "Karan", note: "you owe", amount: "₹300", direction: "out" },
]

export function ProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-border/80 bg-card shadow-2xl shadow-emerald-950/10">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">L</span>
          <div>
            <p className="text-sm font-semibold tracking-tight">Ledgium</p>
            <p className="text-xs text-muted-foreground">Maple House</p>
          </div>
        </div>
        <button type="button" aria-label="Preview options (decorative)" className="flex size-9 items-center justify-center rounded-full text-muted-foreground">
          <Ellipsis className="size-5" />
        </button>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">HOUSEHOLD OVERVIEW</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Your shared finances</h2>
          </div>
          <button type="button" className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium sm:flex">
            This month <ChevronDown className="size-3.5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText className="size-4" />
            </span>
            <p className="mt-3 text-xs text-muted-foreground">Shared expenses</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">₹18,450</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Across your household</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CircleDollarSign className="size-4" />
            </span>
            <p className="mt-3 text-xs text-muted-foreground">Your outstanding</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">₹2,350</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Owed and receivable</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent shared expenses</h3>
            <span className="text-xs font-medium text-primary">Sample data</span>
          </div>
          <div className="divide-y divide-border/70">
            {expenses.map((expense) => (
              <div key={expense.title} className="flex items-center gap-3 py-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${expense.tone}`}>
                  {expense.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{expense.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{expense.category}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums">{expense.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersRound className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Who owes whom</h3>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Example</span>
          </div>
          <div className="mt-3 space-y-3">
            {balances.map((balance) => (
              <div key={balance.name} className="flex items-center gap-3">
                <span className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${balance.direction === "in" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                  {balance.name.slice(0, 1)}
                </span>
                <span className="flex-1 text-sm">
                  <span className="font-medium">{balance.name}</span>{" "}
                  <span className="text-muted-foreground">{balance.note}</span>
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                  {balance.direction === "in" ? <ArrowDownLeft className="size-3.5 text-emerald-600" /> : <ArrowUpRight className="size-3.5 text-amber-600" />}
                  {balance.amount}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <Check className="size-3.5 text-primary" />
            Illustrative interface preview — not live account data.
          </div>
        </div>
      </div>
    </div>
  )
}
