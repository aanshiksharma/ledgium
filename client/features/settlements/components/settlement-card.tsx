import { money, convertToRelativeDate } from "@/lib/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar"
import { Item, ItemContent, ItemHeader } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

import { useHousehold } from "@/features/households"
import { Settlement } from "@/features/debts"
import { ViewSettlement } from "@/features/settlements"

export function SettlementCard({ settlement }: { settlement: Settlement }) {
  const { currentHousehold } = useHousehold()

  return (
    <ViewSettlement settlement={settlement}>
      <Item variant="muted" className="transition-colors hover:bg-muted/75">
        <ItemHeader>
          <p className="text-xl">
            {money(settlement.amount, currentHousehold!.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            {convertToRelativeDate(new Date(settlement.settledAt))}
          </p>
        </ItemHeader>

        <ItemContent>
          <div className="flex max-w-full items-center gap-4">
            <div className="grid w-full flex-1 gap-1 text-muted-foreground">
              {settlement.allocations.length === 1 ? (
                <p className="max-w-full truncate">{`Settled ${settlement.allocations[0].debt.householdExpense?.description}`}</p>
              ) : (
                <p>{`Settled ${settlement.allocations.length} debts`}</p>
              )}
              <p className="text-xs">{`${settlement.debtor.name.split(" ")[0]} paid to ${settlement.creditor.name.split(" ")[0]}`}</p>
            </div>

            <AvatarGroup>
              <Avatar size="sm">
                <AvatarImage src={settlement.debtor.imageUrl ?? undefined} />
                <AvatarFallback>
                  {settlement.debtor.name
                    .split(" ")
                    .map((word) => word.charAt(0))}
                </AvatarFallback>
              </Avatar>

              <Avatar size="sm">
                <AvatarImage src={settlement.creditor.imageUrl ?? undefined} />
                <AvatarFallback>
                  {settlement.creditor.name
                    .split(" ")
                    .map((word) => word.charAt(0))}
                </AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </div>
        </ItemContent>
      </Item>
    </ViewSettlement>
  )
}

export function SettlementCardSkeleton() {
  return (
    <Item variant="muted">
      <ItemHeader>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-8" />
      </ItemHeader>

      <ItemContent>
        <div className="flex items-center gap-4">
          <div className="grid flex-1 gap-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>

          <AvatarGroup>
            <Avatar size="sm">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                <Skeleton className="size-6 rounded-full" />
              </AvatarFallback>
            </Avatar>

            <Avatar size="sm">
              <AvatarImage src={undefined} />
              <AvatarFallback>
                <Skeleton className="size-6 rounded-full" />
              </AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </div>
      </ItemContent>
    </Item>
  )
}
