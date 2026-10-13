import { ReactNode } from "react"

import { ChevronsUpDown, HandCoins, NotebookText } from "lucide-react"

import {
  date,
  convertToRelativeDate,
  money,
  extractInitials,
} from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { useHousehold } from "@/features/households"
import { Settlement } from "@/features/debts"

type Props = { children: ReactNode; settlement: Settlement }

export function ViewSettlement({ children, settlement }: Props) {
  const { currentHousehold } = useHousehold()
  const iconSize = 16

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settlement Details</DialogTitle>
          <DialogDescription>
            {`This debt was settled ${convertToRelativeDate(new Date(settlement.settledAt))}`}
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar grid max-h-[70vh] gap-6 overflow-y-auto p-2">
          <div className="flex gap-2 max-[32rem]:flex-col min-[32rem]:items-center">
            <Label className="min-[32rem]:basis-36">Settled Amount</Label>
            <p className="text-muted-foreground">
              {money(settlement.amount, currentHousehold!.currency)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-4">
              <Label>Settled By</Label>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Avatar>
                  <AvatarImage
                    src={settlement.creditor.imageUrl ?? undefined}
                  />
                  <AvatarFallback>
                    {extractInitials(settlement.creditor.name)}
                  </AvatarFallback>
                </Avatar>

                <p>{settlement.creator.name}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <Label>Paid By</Label>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Avatar>
                  <AvatarImage src={settlement.debtor.imageUrl ?? undefined} />
                  <AvatarFallback>
                    {extractInitials(settlement.debtor.name)}
                  </AvatarFallback>
                </Avatar>

                <p>{settlement.debtor.name}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>
              <NotebookText size={iconSize} />
              <span>Notes</span>
            </Label>

            <p className="text-muted-foreground">
              {settlement.notes ?? "No notes were added!"}
            </p>
          </div>

          <Collapsible defaultOpen>
            <div className="flex items-center">
              <Label className="flex flex-1 items-center gap-2">
                <HandCoins size={iconSize} />
                <span>Debts Settled</span>
                <Badge variant="outline">{settlement.allocations.length}</Badge>
              </Label>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  size="icon"
                >
                  <ChevronsUpDown />
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-3">
              <ItemGroup>
                {settlement.allocations.map((allocation, index) => (
                  <Item key={index} size="sm" variant="muted">
                    <ItemContent>
                      <ItemTitle>
                        {allocation.debt.householdExpense?.description}
                      </ItemTitle>
                      <ItemDescription className="text-xs">
                        {date(
                          allocation.debt.householdExpense?.expenseDate ?? ""
                        )}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <span className="shrink-0 text-sm font-medium">
                        {money(allocation.amount, allocation.debt.currency)}
                      </span>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  )
}
