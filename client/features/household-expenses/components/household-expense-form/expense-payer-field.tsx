import { ReactNode, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Field, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"

import type { HouseholdExpenseFormValues } from "../../types/household-expense-form.types"

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
  const [showPayerSelector, setShowPayerSelector] = useState(false)
  const { getValues, control } = useFormContext<HouseholdExpenseFormValues>()

  const { members } = useMembers()

  const payerId = getValues("payerId")
  const payer = members.find((member) => member.userId === payerId)

  return (
    <section className="space-y-3">
      <h2>Payer</h2>

      <div className="flex items-center gap-2">
        {showPayerSelector ? (
          <Controller
            control={control}
            name="payerId"
            render={({ field, fieldState }) => (
              <Field>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
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
        ) : (
          <Select disabled>
            <SelectTrigger className="flex-1">
              {payer && memberAvatar(payer)}
            </SelectTrigger>
          </Select>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPayerSelector((prev) => !prev)}
          disabled={disabled}
        >
          {showPayerSelector ? "Cancel" : "Change"}
        </Button>
      </div>
    </section>
  )
}
