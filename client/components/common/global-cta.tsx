"use client"

import { ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ButtonGroup } from "@/components/ui/button-group"
import { Button } from "@/components/ui/button"

import { ExpenseFormButton } from "@/features/expenses"

export function GlobalCta() {
  return (
    <ButtonGroup>
      <ExpenseFormButton>
        <Button size="sm">Add Expense</Button>
      </ExpenseFormButton>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm">
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
