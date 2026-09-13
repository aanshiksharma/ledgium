import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Transaction } from "../types/transaction.types"

type Props = {
  transactions: Transaction[]
  isLoading: boolean
  onDelete: (transactionId: string) => Promise<void>
  onDeleteTransfer: (transferId: string) => Promise<void>
  deletingId: string | null
}

function formatAmount(amount: string, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount))
}

export function TransactionList({
  transactions,
  isLoading,
  onDelete,
  onDeleteTransfer,
  deletingId,
}: Props) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading transactions...</p>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <h2 className="font-medium">No transactions found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a transaction or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full min-w-190 text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Date</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Account</th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b last:border-0">
              <td className="px-4 py-3">
                {new Date(transaction.transactionDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/transactions/${transaction.id}`}
                  className="font-medium hover:underline"
                >
                  {transaction.description}
                </Link>
                {transaction.transferId && (
                  <div className="text-xs text-muted-foreground">Transfer</div>
                )}
              </td>
              <td className="px-4 py-3">{transaction.account.name}</td>
              <td className="px-4 py-3">{transaction.category?.name ?? "—"}</td>
              <td className="px-4 py-3 text-right font-medium">
                {formatAmount(transaction.amount, transaction.account.currency)}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    deletingId === transaction.id ||
                    deletingId === transaction.transferId
                  }
                  onClick={() => {
                    if (transaction.transferId) {
                      if (
                        window.confirm(
                          "Delete this transfer and both transaction sides?"
                        )
                      ) {
                        void onDeleteTransfer(transaction.transferId)
                      }
                    } else if (window.confirm("Delete this transaction?")) {
                      void onDelete(transaction.id)
                    }
                  }}
                >
                  {deletingId === transaction.id ||
                  deletingId === transaction.transferId
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
