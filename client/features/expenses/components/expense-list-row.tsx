import { toast } from "sonner"
import { Edit } from "lucide-react"

import { convertToRelativeDate, extractInitials, money } from "@/lib/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar"
import { TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { DynamicIcon } from "@/components/common/dynamic-icon"

import { DeleteExpenseButton } from "@/features/expenses"

import {
  type Expense,
  ExpenseFormButton,
  useExpenses,
} from "@/features/expenses"

type Props = {
  expense: Expense
  hideDelete?: boolean
}

export function ExpenseListRow({ expense, hideDelete = false }: Props) {
  const { isDeleting, deletingId, deleteExpense } = useExpenses()

  const handleDelete = (expenseId: string): void => {
    toast.promise<void>(() => deleteExpense(expenseId), {
      loading: "Deleting Expense",
      success: "Expense has been deleted.",
      error: "Error",
    })
  }

  return (
    <TableRow
      className={
        isDeleting && deletingId === expense.id
          ? "pointer-events-none opacity-20"
          : ""
      }
    >
      <TableCell className="w-full">
        <div className="flex items-center gap-5 pl-2">
          <DynamicIcon
            icon={expense.category?.icon ?? ""}
            size={20}
            style={{ color: expense.category?.color ?? "" }}
          />

          <div className="flex flex-col gap-1">
            <span className="max-w-xs truncate">{expense.description}</span>
            <span className="text-xs text-muted-foreground">
              {convertToRelativeDate(new Date(expense.createdAt))}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-right">
        {money(expense.totalAmount, expense.currency)}
      </TableCell>

      <TableCell className="">
        {expense.category ? (
          <Badge variant="secondary" className="gap-1.5">
            <div
              className={`"aspect-square size-2 rounded-full ${expense.category.color ? "" : "bg-primary"}`}
              style={
                expense.category.color
                  ? {
                      backgroundColor: expense.category.color,
                    }
                  : undefined
              }
            />
            {expense.category.name}
          </Badge>
        ) : (
          "Uncategorized"
        )}
      </TableCell>

      <TableCell>
        <div className="grid grid-cols-[5rem_1fr_1fr] gap-2">
          <AvatarGroup>
            {expense.participants.map((member) => {
              if (
                expense.payers.find((payer) => payer.userId === member.userId)
              )
                return

              return (
                <Avatar key={member.id} size="sm">
                  <AvatarImage
                    src={
                      member.user.imageUrl ? member.user.imageUrl : undefined
                    }
                  />
                  <AvatarFallback>
                    {extractInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
              )
            })}
          </AvatarGroup>

          <AvatarGroup>
            {expense.payers.map((payer) => (
              <div key={payer.id} className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage
                    src={payer.user.imageUrl ? payer.user.imageUrl : undefined}
                  />
                  <AvatarFallback>
                    {extractInitials(payer.user.name)}
                  </AvatarFallback>
                </Avatar>

                <span>{payer.user.name}</span>
              </div>
            ))}
          </AvatarGroup>
        </div>
      </TableCell>

      <TableCell>
        <ExpenseFormButton expense={expense}>
          <Button variant="ghost" size="icon">
            <Edit />
          </Button>
        </ExpenseFormButton>

        <DeleteExpenseButton className={hideDelete ? "hidden" : ""}>
          <Button
            variant="destructive"
            onClick={() => handleDelete(expense.id)}
          >
            Delete
          </Button>
        </DeleteExpenseButton>
      </TableCell>
    </TableRow>
  )
}

export function ExpenseListRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="w-full">
        <Skeleton className="h-4 w-40" />
      </TableCell>

      <TableCell className="text-right">
        <Skeleton className="h-4 w-20" />
      </TableCell>

      <TableCell className="w-full">
        <Skeleton className="h-4 w-30" />
      </TableCell>

      <TableCell>
        <div className="grid grid-cols-[5rem_1fr_1fr] gap-2">
          <AvatarGroup>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </AvatarGroup>

          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-xl" />
          </div>
        </div>
      </TableCell>

      <TableCell className="w-full">
        <Button variant="ghost" size="icon" disabled>
          <Skeleton className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" disabled className="ml-1">
          <Skeleton className="h-6 w-6" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
