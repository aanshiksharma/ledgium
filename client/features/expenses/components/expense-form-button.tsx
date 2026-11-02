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

import { useExpenses, ExpenseForm, type Expense } from "@/features/expenses"

type Props = {
  children: ReactNode
  expense?: Expense
}

const DRAWER_SNAP_POINTS = [0.6, 1]

export function ExpenseFormButton({ children, expense }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeSnapPoint, setActiveSnapPoint] = useState<
    string | number | null
  >(0.6)
  const isMobile = useIsMobile()

  const { isSubmitting, isLoading } = useExpenses()

  const title = `${expense ? "Edit" : "Add"} Expense`

  if (isMobile)
    return (
      <Drawer
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        snapPoints={DRAWER_SNAP_POINTS}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={(snapPoint) => setActiveSnapPoint(snapPoint)}
        snapToSequentialPoint
      >
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent className="max-h-dvh">
          <DrawerHeader className="shrink-0">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <ExpenseForm
              key={expense?.id ?? "new"}
              expense={expense}
              onSuccess={() => setIsFormOpen(false)}
            />
          </div>

          <DrawerFooter className="shrink-0">
            <Button
              type="submit"
              form="household-expense-form"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
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
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="no-scrollbar max-h-[70vh] overflow-y-auto p-1">
            <ExpenseForm
              key={expense?.id ?? "new"}
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
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
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
