import { Controller, useController, useFormContext } from "react-hook-form"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"

import type {
  HouseholdExpenseFormValues,
  SplitMode,
} from "../../types/household-expense-form.types"
import { formatAmount, sumCents } from "../../utils/expense-split.utils"
import { HouseholdMember, useMembers } from "@/features/members"

type Props = {
  participantIds: string[]
  totalCents: number
  differenceCents: number
  balanced: boolean
  currency: string
  splitMode: SplitMode
  disabled?: boolean
}

function memberLabel(member: HouseholdMember): string {
  return member.user?.name || member.user?.email || member.userId
}

export function ExpenseSplitSection({
  participantIds,
  totalCents,
  differenceCents,
  balanced,
  currency,
  splitMode,
  disabled,
}: Props) {
  const { control, formState } = useFormContext<HouseholdExpenseFormValues>()
  const { members } = useMembers()

  const { field: amountsField } = useController({
    name: "customAmounts",
    control,
  })

  const participantMembers = members.filter((member) =>
    participantIds.includes(member.userId)
  )

  const distributedCents = sumCents(amountsField.value, participantIds)

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Split</h3>
        <p className="text-sm text-muted-foreground">
          Decide how the total amount is distributed among participants.
        </p>
      </div>

      <Controller
        name="splitMode"
        control={control}
        render={({ field, fieldState }) => (
          <RadioGroup
            value={field.value}
            onValueChange={(value) => field.onChange(value as SplitMode)}
            disabled={disabled}
            className="grid grid-cols-2 gap-4"
          >
            <FieldLabel htmlFor="equal">
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldTitle>Equal</FieldTitle>
                  <FieldDescription className="text-xs">
                    Distribute the total amount equally
                  </FieldDescription>
                  <RadioGroupItem value="equal" id="equal" className="hidden" />
                </FieldContent>
              </Field>
            </FieldLabel>

            <FieldLabel htmlFor="custom">
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldTitle>Custom</FieldTitle>
                  <FieldDescription className="text-xs">
                    Set different prices for each participant
                  </FieldDescription>
                  <RadioGroupItem
                    value="custom"
                    id="custom"
                    className="hidden"
                  />
                </FieldContent>
              </Field>
            </FieldLabel>
          </RadioGroup>
        )}
      />

      <div className="space-y-3">
        {participantMembers.map((member) => {
          const amount = amountsField.value[member.userId] ?? ""

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between gap-4"
            >
              <span className="min-w-0 truncate">{memberLabel(member)}</span>

              {splitMode === "equal" ? (
                <span className="text-sm text-muted-foreground">
                  {amount || "0.00"} {currency}
                </span>
              ) : (
                <Input
                  value={amount}
                  onChange={(event) =>
                    amountsField.onChange({
                      ...amountsField.value,
                      [member.userId]: event.target.value,
                    })
                  }
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className="w-32"
                  disabled={disabled}
                  aria-label={`Amount for ${memberLabel(member)}`}
                />
              )}
            </div>
          )
        })}
      </div>

      <div
        className={`rounded-lg border p-3 text-sm ${
          balanced ? "text-muted-foreground" : "text-destructive"
        }`}
      >
        <div className="flex justify-between">
          <span>Distributed</span>
          <span>
            {formatAmount(distributedCents)} {currency}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total</span>
          <span>
            {formatAmount(totalCents)} {currency}
          </span>
        </div>

        {!balanced && (
          <p className="mt-2">
            Difference: {formatAmount(Math.abs(differenceCents))} {currency}
          </p>
        )}
      </div>

      <FieldError errors={[formState.errors.root]} />
    </section>
  )
}
