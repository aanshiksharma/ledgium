import { Controller, useFormContext } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { ExpenseFormValues } from "../../types/expense-form.types"

type Props = {
  disabled?: boolean
}

export function ExpenseDateField({ disabled }: Props) {
  const { control } = useFormContext<ExpenseFormValues>()

  return (
    <Controller
      name="expenseDate"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="expense-date">Expense date</FieldLabel>
          <Input
            {...field}
            id="expense-date"
            type="date"
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
