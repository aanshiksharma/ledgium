"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { DashboardFilters } from "../types/dashboard.types"

type Props = {
  value: DashboardFilters
  onApply: (filters: DashboardFilters) => void
  disabled?: boolean
}

function monthBounds(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return {
    from: new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10),
    to: new Date(d.getFullYear(), d.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10),
  }
}

export function DashboardDateFilter({ value, onApply, disabled }: Props) {
  const [from, setFrom] = useState(value.from ?? "")
  const [to, setTo] = useState(value.to ?? "")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFrom(value.from ?? "")
    setTo(value.to ?? "")
  }, [value.from, value.to])

  const apply = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError("The start date cannot be after the end date.")
      return
    }

    setError(null)
    onApply({
      from: nextFrom || undefined,
      to: nextTo || undefined,
    })
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">From</span>
          <input
            type="date"
            value={from}
            disabled={disabled}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 rounded-md border bg-background px-3"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">To</span>
          <input
            type="date"
            value={to}
            disabled={disabled}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 rounded-md border bg-background px-3"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              const b = monthBounds(0)
              setFrom(b.from)
              setTo(b.to)
              apply(b.from, b.to)
            }}
          >
            This month
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              const b = monthBounds(-1)
              setFrom(b.from)
              setTo(b.to)
              apply(b.from, b.to)
            }}
          >
            Last month
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setFrom("")
              setTo("")
              apply("", "")
            }}
          >
            All time
          </Button>

          <Button
            type="button"
            disabled={disabled}
            onClick={() => apply(from, to)}
          >
            Apply
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
