"use client"

import { FormProvider, useForm, useWatch } from "react-hook-form"

import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import {
  Allocation,
  createSettlementInput,
  DebtBalance,
  SettleDebtFormValues,
  useDebts,
} from "@/features/debts"
import { SettleDebtForm } from "./settle-debt-form"

const defaultFormValues: Allocation[] = []

export function SettleDebtButton({ balance }: { balance: DebtBalance }) {
  const form = useForm<SettleDebtFormValues>({
    defaultValues: { allocations: defaultFormValues },
  })
  const { control, setValue, getValues } = form
  const allocations = useWatch({ control, name: "allocations" })

  const { isSubmitting, settle } = useDebts()

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setValue("allocations", [])
      }}
    >
      <DialogTrigger asChild>
        <Button>Settle</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Debt</DialogTitle>
          <DialogDescription>
            You can select multiple debts together by selecting them. Click on a
            debt to select one.
          </DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar max-h-[70vh] overflow-y-auto">
          <FormProvider {...form}>
            <SettleDebtForm balance={balance} />
          </FormProvider>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={isSubmitting || allocations.length === 0}
            type="submit"
            onClick={() => {
              const input = createSettlementInput(
                balance,
                allocations,
                getValues("notes")
              )
              settle(input)
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                <Loader2 className="animate-spin" /> Settling
              </div>
            ) : (
              "Settle"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
