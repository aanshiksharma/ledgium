"use client"

import { useHousehold } from "../hooks/use-household"

export function HouseholdSelector() {
  const { households, currentHousehold, isLoading, selectHousehold } =
    useHousehold()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Loading households...
        </span>
      </div>
    )
  }

  if (households.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No households yet.</div>
    )
  }

  return (
    <label className="flex items-center gap-3">
      <span className="text-sm font-medium">Household</span>

      <select
        value={currentHousehold?.id ?? ""}
        onChange={(event) => selectHousehold(event.target.value)}
        className="rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        aria-label="Select household"
      >
        {households.map((household) => (
          <option key={household.id} value={household.id}>
            {household.name}
          </option>
        ))}
      </select>
    </label>
  )
}
