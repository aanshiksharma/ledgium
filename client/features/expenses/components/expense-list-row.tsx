import { type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

import { convertToPascalCase, convertToRelativeDate, money } from "@/lib/utils"

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

import { useMembers } from "@/features/members"
import { useHousehold } from "@/features/households"
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
  const iconName = convertToPascalCase(
    expense.category?.icon ? expense.category.icon : ""
  )

  const SafeIcon =
    (Icons as unknown as Record<string, LucideIcon>)[iconName] ||
    Icons.ShoppingBasket

  const { members } = useMembers()
  const { currentHousehold } = useHousehold()
  const { isSubmitting } = useExpenses()

  return (
    <TableRow>
      <TableCell className="w-full">
        <div className="flex items-center gap-5 pl-2">
          <SafeIcon size={20} />

          <div className="flex flex-col gap-1">
            <span>{expense.description}</span>
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
            {expense.debts.map((debt) => {
              const member = members.find(
                (member) => member.userId === debt.debtorId
              )

              if (member)
                return (
                  <Avatar key={member.id} size="sm">
                    <AvatarImage
                      src={
                        member.user.imageUrl ? member.user.imageUrl : undefined
                      }
                    />
                    <AvatarFallback>
                      {member.user.name
                        .split(" ")
                        .map((word) => word.charAt(0))}
                    </AvatarFallback>
                  </Avatar>
                )
            })}
          </AvatarGroup>

          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={
                  expense.creator.imageUrl
                    ? expense.creator.imageUrl
                    : undefined
                }
              />
              <AvatarFallback>
                {expense.creator.name.split(" ").map((word) => word.charAt(0))}
              </AvatarFallback>
            </Avatar>

            <span>{expense.creator.name}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <ExpenseFormButton
          currentHousehold={currentHousehold!}
          isSubmitting={isSubmitting}
          expense={expense}
        >
          <Button variant="ghost" size="icon">
            <Icons.Edit />
          </Button>
        </ExpenseFormButton>

        <Button
          variant="ghost"
          size="icon"
          className={
            hideDelete
              ? "hidden"
              : "ml-1 text-destructive hover:text-destructive"
          }
        >
          <Icons.Trash />
        </Button>
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
