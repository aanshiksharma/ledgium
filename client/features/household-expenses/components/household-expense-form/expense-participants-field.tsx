import { Controller, useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import type { HouseholdExpenseFormValues } from "../../types/household-expense-form.types"
import { type HouseholdMember, useMembers } from "@/features/members"

type Props = {
  disabled?: boolean
}

function memberLabel(member: HouseholdMember): string {
  return member.user?.name || member.user?.email || member.userId
}

export function ExpenseParticipantsField({ disabled }: Props) {
  const { control, formState } = useFormContext<HouseholdExpenseFormValues>()
  const error = formState.errors.participantIds

  const { members } = useMembers()

  return (
    <Controller
      name="participantIds"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>Participants</FieldLabel>

          <div className="space-y-3 rounded-lg border p-4">
            {members.map((member) => (
              <label
                key={member.userId}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  checked={field.value.includes(member.userId)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      field.onChange([...field.value, member.userId])
                    } else {
                      field.onChange(
                        field.value.filter((id) => id !== member.userId)
                      )
                    }
                  }}
                  disabled={disabled}
                />
                <span>{memberLabel(member)}</span>
              </label>
            ))}
          </div>

          <FieldError errors={[error]} />
        </Field>
      )}
    />
  )
}
