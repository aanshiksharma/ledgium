"use client"

import Link from "next/link"

import { convertToRelativeDate } from "@/lib/utils"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

import { RecentExpenses } from "./recent-expenses"
import { DebtsOverview } from "./debts-overview"

import { useMembers } from "@/features/members"
import { Household } from "@/features/households"

type Props = {
  currentHousehold: Household
}

export function HouseholdOverview({ currentHousehold }: Props) {
  const { members } = useMembers(currentHousehold.id)

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_3fr] lg:gap-6">
        <Card>
          <CardHeader>
            <Label className="text-xs text-muted-foreground">
              Current Household
            </Label>

            <CardTitle className="text-2xl">{currentHousehold.name}</CardTitle>

            <CardDescription className="mt-3">
              <Label className="mb-0.5 text-xs">Created</Label>
              <p>
                <span className="capitalize">
                  {convertToRelativeDate(
                    new Date(currentHousehold.createdAt)
                  )}{" "}
                </span>
                by{" "}
                <span className="capitalize">
                  {
                    members?.filter((member) => member.role === "OWNER")[0]
                      ?.user.name
                  }
                </span>
              </p>
            </CardDescription>

            <CardAction>
              <Badge variant="outline">{currentHousehold.currency}</Badge>
            </CardAction>
          </CardHeader>

          <CardContent>
            <header className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-muted-foreground">
                Members
                <Badge variant="outline">{members.length}</Badge>
              </h2>

              <Link href="/members" className="text-xs hover:underline">
                See All
              </Link>
            </header>

            <div className="mt-4 flex flex-col gap-1">
              {members
                .filter((_, index) => index < 4)
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm capitalize">
                      {member.user.name}
                    </span>

                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <DebtsOverview />
      </section>

      <RecentExpenses />
    </div>
  )
}
