import Link from "next/link"

import { type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

import { convertToPascalCase, convertToRelativeDate, money } from "@/lib/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useMembers } from "@/features/members"
import { useHouseholdExpenses } from "@/features/household-expenses"

type Props = {
  currentHouseholdId: string
}

export function RecentExpenses({ currentHouseholdId }: Props) {
  const { isLoading: membersLoading, members } = useMembers(currentHouseholdId)
  const { isLoading: expensesLoading, expenses } =
    useHouseholdExpenses(currentHouseholdId)

  return (
    <section className="flex flex-col gap-4 lg:gap-6">
      <header className="flex items-center justify-between px-1 pt-4">
        <h2 className="text-xl">Recent Expenses</h2>

        <Link href="/expenses" className="text-xs hover:underline">
          See All
        </Link>
      </header>

      <section className="overflow-hidden rounded-xl bg-muted/25">
        {membersLoading || expensesLoading || !members || !expenses ? (
          <Table>
            <TableBody>
              {Array.from(new Array(10)).map((_, index) => (
                <TableRow key={index}>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : expenses.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <Icons.Book />
              </EmptyMedia>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>
                Your household does not have any expenses yet. Add an expense
                and start managing your expenses.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableBody>
              {expenses
                .filter((_, index) => index < 10)
                .map((expense) => {
                  const iconName = convertToPascalCase(
                    expense.category?.icon ? expense.category.icon : ""
                  )

                  const SafeIcon =
                    (Icons as unknown as Record<string, LucideIcon>)[
                      iconName
                    ] || Icons.ShoppingBasket

                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="w-full">
                        <div className="flex items-center gap-5 pl-2">
                          <SafeIcon size={20} />

                          <div className="flex flex-col gap-1">
                            <span>{expense.description}</span>
                            <span className="text-xs text-muted-foreground">
                              {convertToRelativeDate(
                                new Date(expense.createdAt)
                              )}
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
                                        member.user.imageUrl
                                          ? member.user.imageUrl
                                          : undefined
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
                                {expense.creator.name
                                  .split(" ")
                                  .map((word) => word.charAt(0))}
                              </AvatarFallback>
                            </Avatar>

                            <span>{expense.creator.name}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" asChild>
                          <Link href={`/expense/edit/${expense.id}`}>
                            <Icons.Edit size={16} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        )}
      </section>
    </section>
  )
}
