import { Controller, useController, useFormContext } from "react-hook-form"

import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
  FieldContent,
  FieldTitle,
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
import { useIsMobile } from "@/hooks/use-mobile"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
  const { members } = useMembers()
  const { currentHousehold } = useHousehold()
  const isMobile = useIsMobile()

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
          <RadioGroup
            defaultValue="equal"
            value={field.value}
            onValueChange={(value) => field.onChange(value as SplitMode)}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            className="relative grid grid-cols-2 gap-0 rounded-3xl bg-accent"
          >
            <FieldLabel
              htmlFor="equal-split"
              className="relative z-10 h-fit rounded-3xl! border-0! has-data-checked:bg-transparent!"
            >
              <Field className="py-2!">
                <FieldContent className="items-center">
                  <FieldTitle>Equal Split</FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value="equal"
                  id="equal-split"
                  className="hidden"
                />
              </Field>
            </FieldLabel>

            <FieldLabel
              htmlFor="custom-split"
              className="relative z-10 h-fit rounded-3xl! border-0! has-data-checked:bg-transparent!"
            >
              <Field className="py-2!">
                <FieldContent className="items-center">
                  <FieldTitle>Custom Split</FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  value="custom"
                  id="custom-split"
                  className="hidden"
                />
              </Field>
            </FieldLabel>

            <div
              className={`absolute inset-y-0 left-0 z-5 w-1/2 rounded-3xl bg-primary transition-transform duration-300 ease-out ${field.value === "equal" ? "translate-x-0" : "translate-x-full"}`}
            />
          </RadioGroup>
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
                  <Field className="justify-between gap-4 sm:flex-row">
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
                          className="w-full min-w-32 sm:w-fit"
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
                              className="w-full font-mono sm:max-w-32"
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
