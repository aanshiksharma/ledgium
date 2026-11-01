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
import { Skeleton } from "@/components/ui/skeleton"

import type { ExpenseFormValues } from "@/features/expenses"
import { useCategories } from "@/features/categories"
import { useHousehold } from "@/features/households"
import { Badge } from "@/components/ui/badge"
import { getCurrency } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function ExpenseDetailsFields({ disabled }: { disabled?: boolean }) {
  const { currentHousehold } = useHousehold()
  const { control } = useFormContext<ExpenseFormValues>()
  const { isLoading, categories } = useCategories()

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
                onValueChange={(value) => {
                  if (value) field.onChange(value)
                }}
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
            <FieldLabel htmlFor="expense-total">Total amount</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                {getCurrency(currentHousehold!.currency)}
              </InputGroupAddon>
              <InputGroupInput
                value={field.value}
                onChange={(e) => {
                  if (e.target.value === "" || Number(e.target.value))
                    field.onChange(e.target.value)
                }}
                id="expense-total"
                placeholder="0.00"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
            </InputGroup>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </FieldGroup>
  )
}
