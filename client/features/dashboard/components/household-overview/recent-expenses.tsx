import Link from "next/link"

import { type LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Avatar,
  AvatarGroup,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { convertToPascalCase, convertToRelativeDate, money } from "@/lib/utils"

import { useMembers } from "@/features/members"
import { useHousehold } from "@/features/households"
import { useHouseholdExpenses } from "@/features/household-expenses"
import React from "react"

export function RecentExpenses() {
  const { currentHousehold } = useHousehold()
  const { members } = useMembers(currentHousehold ? currentHousehold.id : null)
  const { expenses } = useHouseholdExpenses(
    currentHousehold ? currentHousehold.id : null
  )

  return (
    <section className="flex flex-col gap-4 lg:gap-6">
      <header className="flex items-center justify-between px-1 pt-4">
        <h2 className="text-xl">Recent Expenses</h2>

        <Link href="/expenses" className="text-xs hover:underline">
          See All
        </Link>
      </header>

      <section className="overflow-hidden rounded-xl bg-muted/25">
        <Table>
          <TableBody>
            {expenses
              ?.filter((_, index) => index < 10)
              .map((expense) => {
                const iconName = convertToPascalCase(
                  expense.category?.icon ? expense.category.icon : ""
                )

                const SafeIcon =
                  (Icons as unknown as Record<string, LucideIcon>)[iconName] ||
                  Icons.ShoppingBasket

                return (
                  <TableRow key={expense.id}>
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
                            )?.user

                            return (
                              <Avatar key={member?.id} size="sm">
                                <AvatarImage src={member?.imageUrl} />
                                <AvatarFallback>
                                  {member?.name
                                    .split(" ")
                                    .map((word) => word.charAt(0))}
                                </AvatarFallback>
                              </Avatar>
                            )
                          })}
                        </AvatarGroup>

                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarImage src={expense.creator.imageUrl} />
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
                          {React.createElement(Icons.Edit)}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </section>
    </section>
  )
}
