import Link from "next/link"

import { convertToRelativeDate } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

import { useHousehold } from "@/features/households"
import { useMembers } from "@/features/members"

type Props = {
  currentHouseholdId: string
}

export function HouseholdDetails({ currentHouseholdId }: Props) {
  const { isLoading: householdLoading, currentHousehold } = useHousehold()
  const { isLoading: membersLoading, members } = useMembers()

  return (
    <Card>
      <CardHeader>
        <Label className="text-xs text-muted-foreground">
          Current Household
        </Label>

        {householdLoading || !currentHousehold ? (
          <Skeleton className="h-8 w-40 rounded-xl" />
        ) : (
          <CardTitle className="text-2xl">{currentHousehold.name}</CardTitle>
        )}

        <CardDescription className="mt-3">
          <Label className="mb-0.5 text-xs">Created</Label>
          {householdLoading || !currentHousehold ? (
            <Skeleton className="h-8 w-full rounded-xl" />
          ) : (
            <p>
              <span>
                {convertToRelativeDate(
                  new Date(currentHousehold.createdAt)
                )}{" "}
              </span>
              by{" "}
              <span className="capitalize">
                {
                  members?.filter((member) => member.role === "OWNER")[0]?.user
                    .name
                }
              </span>
            </p>
          )}
        </CardDescription>

        <CardAction>
          <Badge variant="outline">
            {householdLoading || !currentHousehold ? (
              <Skeleton className="h-4 w-10 rounded-xl" />
            ) : (
              currentHousehold.currency
            )}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent>
        <header className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-muted-foreground">
            Members
            {!membersLoading && (
              <Badge variant="outline">{members.length}</Badge>
            )}
          </h2>

          <Link href="/members" className="text-xs hover:underline">
            See All
          </Link>
        </header>

        <div className="mt-4 flex flex-col gap-1">
          {membersLoading
            ? Array.from(new Array(4)).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
                >
                  <Skeleton className="h-4 w-20 rounded-xl" />
                  <Skeleton className="h-4 w-10 rounded-xl" />
                </div>
              ))
            : members
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
  )
}
