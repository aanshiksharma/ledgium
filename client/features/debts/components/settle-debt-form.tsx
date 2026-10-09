"use client"

import { useState } from "react"

import {
  Controller,
  useFormContext,
  ControllerRenderProps,
  useWatch,
} from "react-hook-form"

import { type CheckedState } from "radix-ui/checkbox"

import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DebtBalance, SettleDebtFormValues } from "../types/debt.types"
import { Edit, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

function CustomAmountInputField({
  field,
  debt,
}: {
  field: ControllerRenderProps<SettleDebtFormValues, "allocations">
  debt: DebtBalance["debts"][0]
}) {
  const [disabled, setDisabled] = useState<boolean>(true)

  const allocation = field.value.find(
    (allocation) => allocation.debtId === debt.id
  )

  const amount = allocation?.amount ?? debt.remainingAmount

  const handleAmountChange = (value: string) => {
    const amount = Number(value)

    if (Number.isNaN(amount)) return

    field.onChange(
      field.value.map((allocation) =>
        allocation.debtId === debt.id
          ? {
              ...allocation,
              amount,
            }
          : allocation
      )
    )
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        type="number"
        min={0}
        max={debt.remainingAmount}
        className="w-32 text-right"
        value={amount}
        disabled={disabled || !allocation}
        onChange={(e) => handleAmountChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.currentTarget.blur()}
      />

      <Button
        variant="ghost"
        type="button"
        size="icon"
        disabled={!allocation}
        onClick={(e) => {
          e.stopPropagation()
          setDisabled((prev) => !prev)
        }}
      >
        {disabled || !allocation ? <Edit /> : <X />}
      </Button>
    </div>
  )
}

export function SettleDebtForm({ balance }: { balance: DebtBalance }) {
  const { control, setValue } = useFormContext<SettleDebtFormValues>()
  const allocations = useWatch({ control, name: "allocations" })
  const allSelected = allocations.length === balance.debts.length

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <FieldGroup className="p-2">
        <Controller
          name="allocations"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="justify-between">
                <h3>Choose Debts</h3>

                <Button
                  variant="link"
                  size="xs"
                  type="button"
                  className="text-muted-foreground"
                  onClick={() => {
                    !allSelected
                      ? setValue(
                          "allocations",
                          balance.debts.map((val) => ({
                            debtId: val.id,
                            amount: Number(val.remainingAmount),
                          }))
                        )
                      : setValue("allocations", [])
                  }}
                >
                  {!allSelected ? "Select All" : "Deselect All"}
                </Button>
              </FieldLabel>

              <FieldContent className="gap-2">
                {balance.debts.map((debt) => {
                  const checked: CheckedState =
                    field.value.filter((val) => val.debtId === debt.id).length >
                    0

                  return (
                    <FieldLabel
                      key={debt.id}
                      htmlFor={debt.id}
                      className="flex w-full items-center justify-between rounded-xl border p-4"
                    >
                      <p className="w-xs flex-1">{debt.description}</p>

                      <CustomAmountInputField field={field} debt={debt} />

                      <Checkbox
                        id={debt.id}
                        className="hidden"
                        checked={checked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            // Prevent duplicate allocations
                            if (
                              field.value.some(
                                (allocation) => allocation.debtId === debt.id
                              )
                            )
                              return

                            field.onChange([
                              ...field.value,
                              {
                                debtId: debt.id,
                                amount: debt.remainingAmount,
                              },
                            ])
                          } else {
                            field.onChange(
                              field.value.filter(
                                (allocation) => allocation.debtId !== debt.id
                              )
                            )
                          }
                        }}
                      />
                    </FieldLabel>
                  )
                })}
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                placeholder="Write optional notes to remember the settlement better"
                value={field.value}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  )
}
