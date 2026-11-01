"use client"

import { FormProvider } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { ExpenseDateField } from "./expense-date-field"
import { ExpenseDetailsFields } from "./expense-details-fields"
import { ExpensePayerField } from "./expense-payer-field"
import { ExpenseSplitSection } from "./expense-split-section"
import { useExpenseForm, type ExpenseFormProps } from "@/features/expenses"

export function ExpenseForm(props: ExpenseFormProps) {
  const {
    form,
    values,
    totalCents,
    differenceCents,
    distributionBalanced,
    financialFieldsLocked,
    submit,
  } = useExpenseForm(props)

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} id="household-expense-form" className="space-y-6">
        <ExpenseDetailsFields disabled={financialFieldsLocked} />

        <ExpenseSplitSection
          participantIds={values.participantIds}
          totalCents={totalCents}
          differenceCents={differenceCents}
          balanced={distributionBalanced}
          splitMode={values.splitMode}
          disabled={financialFieldsLocked}
        />

        <ExpensePayerField disabled={financialFieldsLocked} />

        <ExpenseDateField disabled={financialFieldsLocked} />

        {form.formState.errors.root?.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
      </form>
    </FormProvider>
  )
}
