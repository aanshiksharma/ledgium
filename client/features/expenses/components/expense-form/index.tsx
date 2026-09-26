"use client"

import { FormProvider } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"

import { ExpenseDateField } from "./expense-date-field"
import { ExpenseDetailsFields } from "./expense-details-fields"
import { ExpenseParticipantsField } from "./expense-participants-field"
import { ExpensePayerField } from "./expense-payer-field"
import { ExpenseSplitSection } from "./expense-split-section"
import { useExpenseForm } from "@/features/expenses"
import type { ExpenseFormProps } from "../../types/expense-form.types"
import { useHousehold } from "@/features/households"

export function ExpenseForm(props: ExpenseFormProps) {
  const {
    form,
    values,
    totalCents,
    differenceCents,
    distributionBalanced,
    financialFieldsLocked,
    hasRecordedSettlements,
    submit,
  } = useExpenseForm(props)

  const { currentHousehold } = useHousehold()

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} id="household-expense-form" className="space-y-6">
        {financialFieldsLocked && hasRecordedSettlements && (
          <Alert>
            <AlertDescription>
              This expense has recorded settlements. Its financial fields are
              locked to preserve settlement history.
            </AlertDescription>
          </Alert>
        )}

        <ExpenseDetailsFields
          householdId={props.householdId}
          currency={props.currency}
          disabled={financialFieldsLocked}
        />

        <ExpenseParticipantsField disabled={financialFieldsLocked} />

        <ExpenseSplitSection
          participantIds={values.participantIds}
          totalCents={totalCents}
          differenceCents={differenceCents}
          balanced={distributionBalanced}
          currency={props.currency}
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
