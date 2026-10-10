"use client"

import { ChevronDown, ListPlus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

import { ExpenseFormButton } from "@/features/expenses"

import { useIsMobile } from "@/hooks/use-mobile"

export function GlobalCta() {
  const isMobile = useIsMobile()

  return (
    <ButtonGroup>
      <ExpenseFormButton>
        {isMobile ? (
          <Button size="icon-sm" className="pl-1.75">
            <ListPlus />
          </Button>
        ) : (
          <Button size="sm" className="pl-4">
            Add Expense
          </Button>
        )}
      </ExpenseFormButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" className="pr-1">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem>Add Category</DropdownMenuItem>
          <DropdownMenuItem>Add Member</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
