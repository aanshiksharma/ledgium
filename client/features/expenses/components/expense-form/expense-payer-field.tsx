import { ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import type { ExpenseFormValues } from "@/features/expenses"

import { type HouseholdMember, useMembers } from "@/features/members"

type Props = {
  disabled?: boolean
}

function memberAvatar(member: HouseholdMember): ReactNode {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        <AvatarImage
          src={member.user?.imageUrl ? member.user.imageUrl : undefined}
        />
        <AvatarFallback>
          {member.user?.name.split(" ").map((word) => word.charAt(0))}
        </AvatarFallback>
      </Avatar>

      {member.user?.name}
    </div>
  )
}

export function ExpensePayerField({ disabled }: Props) {
  const { control } = useFormContext<ExpenseFormValues>()
  const { members } = useMembers()

  return (
    <section className="space-y-3">
      <FieldLabel>Paid By</FieldLabel>

      <Controller
        control={control}
        name="payerId"
        render={({ field, fieldState }) => (
          <Field>
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value)
              }}
              disabled={disabled}
            >
              <SelectTrigger aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.userId} value={member.userId}>
                    {memberAvatar(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </section>
  )
}
