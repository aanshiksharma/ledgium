"use client"

import { SubmitEvent, useState } from "react"

import { House, IndianRupee } from "lucide-react"

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"

import { useHousehold } from "../hooks/use-household"
import Link from "next/link"

export function NewHouseholdForm() {
  const { createHousehold, isCreating } = useHousehold()

  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [currencyError, setCurrencyError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    setNameError(null)
    setCurrencyError(null)

    const trimmedName = name.trim()
    const normalizedCurrency = currency.trim().toUpperCase()

    if (trimmedName.length < 2) {
      setNameError("Household name must contain at least 2 characters.")
      return
    }

    if (trimmedName.length > 100) {
      setNameError("Household name cannot exceed 100 characters.")
      return
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setCurrencyError("Currency must be a 3-letter ISO currency code.")
      return
    }

    try {
      await createHousehold({
        name: trimmedName,
        currency: normalizedCurrency,
      })

      setName("")
      setCurrency("INR")
    } catch (requestError) {
      setCurrencyError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create household."
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>

          <InputGroup>
            <InputGroupAddon>
              <House />
            </InputGroupAddon>

            <InputGroupInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Household Name"
              maxLength={100}
              required
              autoFocus
            />
          </InputGroup>

          {nameError && <FieldError>{nameError}</FieldError>}
        </Field>

        <Field>
          <FieldLabel>Currency</FieldLabel>

          <InputGroup>
            <InputGroupAddon>
              <IndianRupee />
            </InputGroupAddon>

            <InputGroupInput
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder="INR"
              maxLength={3}
              required
            />
          </InputGroup>

          {currencyError && <FieldError>{currencyError}</FieldError>}
        </Field>

        <Field>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create household"}
          </Button>

          <FieldSeparator>or</FieldSeparator>

          <Button variant="ghost" asChild>
            <Link href="/households/join">Join existing household</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
