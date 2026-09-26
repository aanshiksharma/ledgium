"use client"

import { ReactNode, useState } from "react"

import { Loader2 } from "lucide-react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useIsMobile } from "@/hooks/use-mobile"

import { ExpenseForm, type Expense } from "@/features/expenses"
import { type Household } from "@/features/households"

type Props = {
  children: ReactNode
  currentHousehold: Household
  expense?: Expense
  isSubmitting: boolean
}

export function ExpenseFormButton({
  children,
  currentHousehold,
  expense,
  isSubmitting,
}: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const isMobile = useIsMobile()

  if (isMobile)
    return (
      <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{expense ? "Edit" : "Add"} Expense</DrawerTitle>
          </DrawerHeader>

          <div className="no-scrollbar max-h-[70vh] overflow-y-auto p-4">
            <ExpenseForm
              key={expense?.id ?? "new"}
              householdId={currentHousehold.id}
              currency={currentHousehold.currency}
              expense={expense}
              onSuccess={() => setIsFormOpen(false)}
            />
          </div>

          <DrawerFooter>
            <Button
              type="submit"
              form="household-expense-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {expense ? "Saving Changes" : "Adding Expense"}
                </>
              ) : expense ? (
                "Save Changes"
              ) : (
                "Add Expense"
              )}
            </Button>

            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  else
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{expense ? "Edit" : "Add"} Expense</DialogTitle>
          </DialogHeader>

          <div className="no-scrollbar max-h-[70vh] overflow-y-auto p-1">
            <ExpenseForm
              key={expense?.id ?? "new"}
              householdId={currentHousehold.id}
              currency={currentHousehold.currency}
              expense={expense}
              onSuccess={() => setIsFormOpen(false)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>

            <Button
              type="submit"
              form="household-expense-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {expense ? "Saving Changes" : "Adding Expense"}
                </>
              ) : expense ? (
                "Save Changes"
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}
