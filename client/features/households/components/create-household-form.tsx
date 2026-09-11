"use client"

import { SubmitEvent, useState } from "react"

import { Button } from "@/components/ui/button"

import { useHousehold } from "../hooks/use-household"

export function CreateHouseholdForm() {
  const { createHousehold, isCreating } = useHousehold()

  const [name, setName] = useState("")
  const [currency, setCurrency] = useState("INR")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    const normalizedCurrency = currency.trim().toUpperCase()

    if (trimmedName.length < 2) {
      setError("Household name must contain at least 2 characters.")
      return
    }

    if (trimmedName.length > 100) {
      setError("Household name cannot exceed 100 characters.")
      return
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setError("Currency must be a 3-letter ISO currency code.")
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
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create household."
      )
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-md flex-col gap-4 rounded-lg border p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Create household</h2>
        <p className="text-sm text-muted-foreground">
          Create a household to start managing shared finances.
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Sharma Family"
          maxLength={100}
          required
          className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Currency</span>
        <input
          value={currency}
          onChange={(event) => setCurrency(event.target.value.toUpperCase())}
          placeholder="INR"
          maxLength={3}
          required
          className="rounded-md border bg-background px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create household"}
      </Button>
    </form>
  )
}
