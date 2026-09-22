"use client"

import { useState, SubmitEvent } from "react"
import Link from "next/link"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useHousehold } from "@/features/households"

export function JoinHouseholdForm() {
  const [householdId, setHouseholdId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const { isCreating, households } = useHousehold()

  const handleHouseholdJoin = () => {}
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    setError(null)

    if (householdId.trim().length !== 36)
      return setError("Please enter a valid household ID")

    const housedhold = households.find((h) => h.id === householdId.trim())

    if (!housedhold)
      return setError(
        "Household not found. Please check the ID or contact the owner."
      )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Household ID</FieldLabel>

          <Input
            placeholder="Enter a household ID"
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
          />

          {error && <FieldError>{error}</FieldError>}
        </Field>

        <Field>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Joining..." : "Join household"}
          </Button>

          <FieldSeparator>or</FieldSeparator>

          <Button variant="ghost" asChild>
            <Link href="/households/new">Create new household</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
