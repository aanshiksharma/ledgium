import Link from "next/link"
import { Archive, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Account } from "../types/account.types"

const TYPE_LABELS: Record<Account["type"], string> = {
  BANK: "Bank",
  CASH: "Cash",
  CREDIT_CARD: "Credit card",
  INVESTMENT: "Investment",
  OTHER: "Other",
}

type AccountCardProps = {
  account: Account
  onSetActive: (active: boolean) => Promise<void>
  isUpdating: boolean
}

export function AccountCard({ account, onSetActive, isUpdating }: AccountCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/accounts/${account.id}`} className="text-lg font-semibold hover:underline">
            {account.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {TYPE_LABELS[account.type]} · {account.currency}
          </p>
        </div>
        <span className="rounded-full border px-2.5 py-1 text-xs">
          {account.isActive ? "Active" : "Archived"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Opening balance</p>
          <p className="mt-1 font-medium">{account.currency} {account.openingBalance}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Transactions</p>
          <p className="mt-1 font-medium">{account._count.transactions}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/accounts/${account.id}`}>Details</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          onClick={() => void onSetActive(!account.isActive)}
        >
          {account.isActive ? <Archive /> : <RotateCcw />}
          {account.isActive ? "Archive" : "Restore"}
        </Button>
      </div>
    </article>
  )
}
