"use client"

import { Controller, useFormContext } from "react-hook-form"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { HouseholdExpenseFormValues } from "../../types/household-expense-form.types"
import { useCategories } from "@/features/categories"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  householdId: string
  currency: string
  disabled?: boolean
}

export function ExpenseDetailsFields({
  householdId,
  currency,
  disabled,
}: Props) {
  const { control } = useFormContext<HouseholdExpenseFormValues>()
  const { isLoading, categories } = useCategories(householdId)

  return (
    <FieldGroup>
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="expense-description">Expense name</FieldLabel>
            <Input
              {...field}
              required
              id="expense-description"
              placeholder="e.g. Groceries"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        name="categoryId"
        control={control}
        render={({ field, fieldState }) =>
          isLoading ? (
            <Select disabled>
              <SelectTrigger className="w-full">
                <Skeleton className="h-4 w-full" />
              </SelectTrigger>
            </Select>
          ) : (
            <Field data-invalid={fieldState.invalid}>
              <FieldTitle>Category</FieldTitle>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError errors={[fieldState.error]} />
            </Field>
          )
        }
      />

      <Controller
        name="totalAmount"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="expense-total">
              Total amount ({currency})
            </FieldLabel>
            <Input
              {...field}
              id="expense-total"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </FieldGroup>
  )
}
