import { Controller, useController, useFormContext } from "react-hook-form"

import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Item,
  ItemGroup,
  ItemTitle,
  ItemDescription,
  ItemContent,
} from "@/components/ui/item"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"

import {
  formatAmount,
  sumCents,
  type ExpenseFormValues,
  type SplitMode,
} from "@/features/expenses"
import { HouseholdMember, useMembers } from "@/features/members"
import { useHousehold } from "@/features/households"

import { extractInitials, getCurrency } from "@/lib/utils"

type Props = {
  participantIds: string[]
  totalCents: number
  differenceCents: number
  balanced: boolean
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
  splitMode,
  disabled,
}: Props) {
  const { control, formState } = useFormContext<ExpenseFormValues>()
  const error = formState.errors.participantIds

  const { members } = useMembers()
  const { currentHousehold } = useHousehold()

  const { field: amountsField } = useController({
    name: "customAmounts",
    control,
  })

  const distributedCents = sumCents(amountsField.value, participantIds)

  return (
    <section className="space-y-6">
      <Controller
        name="splitMode"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <ToggleGroup
              type="single"
              variant="outline"
              value={field.value}
              onValueChange={(value) => field.onChange(value as SplitMode)}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem
                value="equal"
                className="flex items-center justify-center py-8"
              >
                Equal Split
              </ToggleGroupItem>
              <ToggleGroupItem
                value="custom"
                className="flex items-center justify-center py-8"
              >
                Custom Split
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        )}
      />

      <Controller
        name="participantIds"
        control={control}
        render={({ field: memberField, fieldState }) => (
          <FieldGroup data-invalid={fieldState.invalid} className="gap-2">
            {members.map((member) => {
              const checked = memberField.value.includes(member.userId)

              return (
                <FieldLabel key={member.id} className="rounded-3xl!">
                  <Field orientation="horizontal" className="justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          if (value) {
                            memberField.onChange([
                              ...memberField.value,
                              member.userId,
                            ])
                          } else {
                            memberField.onChange(
                              memberField.value.filter(
                                (id) => id !== member.userId
                              )
                            )
                          }
                        }}
                        disabled={disabled}
                        className="hidden"
                      />

                      <Avatar>
                        <AvatarImage src={member.user.imageUrl ?? ""} />
                        <AvatarFallback>
                          {extractInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <span>{memberLabel(member)}</span>
                    </div>

                    <Controller
                      name="customAmounts"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field
                          aria-invalid={fieldState.invalid}
                          className="w-fit"
                        >
                          <InputGroup>
                            <InputGroupAddon>
                              {getCurrency(currentHousehold!.currency)}
                            </InputGroupAddon>
                            <InputGroupInput
                              value={
                                checked
                                  ? (field.value?.[member.userId] ?? "")
                                  : "0"
                              }
                              onChange={(e) => {
                                if (
                                  checked &&
                                  (e.target.value === "" ||
                                    Number(e.target.value))
                                ) {
                                  field.onChange({
                                    ...field.value,
                                    [member.userId]: e.target.value,
                                  })
                                }
                              }}
                              className="w-full max-w-32 text-right"
                              disabled={
                                disabled || splitMode === "equal" || !checked
                              }
                              placeholder="0.00"
                              aria-label={`Amount for ${memberLabel(member)}`}
                            />
                          </InputGroup>
                        </Field>
                      )}
                    />
                  </Field>
                </FieldLabel>
              )
            })}

            <FieldError errors={[fieldState.error]} />
          </FieldGroup>
        )}
      />

      {splitMode === "custom" && !balanced ? (
        <ItemGroup className="flex-row rounded-3xl border-2 border-destructive/20 bg-destructive/10">
          <Item className="col-span-2">
            <ItemContent>
              <ItemTitle>Total</ItemTitle>
              <ItemDescription>
                {formatAmount(totalCents)} {currentHousehold!.currency}
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item>
            <ItemContent>
              <ItemTitle>Distributed</ItemTitle>
              <ItemDescription>
                {formatAmount(distributedCents)} {currentHousehold!.currency}
              </ItemDescription>
            </ItemContent>
          </Item>

          <Item>
            <ItemContent>
              <ItemTitle>Difference</ItemTitle>
              <ItemDescription>
                {formatAmount(Math.abs(differenceCents))}{" "}
                {currentHousehold!.currency}
              </ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      ) : null}

      <FieldError errors={[formState.errors.root]} />
    </section>
  )
}
