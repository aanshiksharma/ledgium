import { useEffect, useState } from "react"

import { format } from "date-fns"
import { Calendar as CalendarIcon, Filter } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { DashboardFilters } from "../types/dashboard.types"
import { useSidebar } from "@/components/ui/sidebar"

type Props = {
  value: DashboardFilters
  onApply: (filters: DashboardFilters) => void
  disabled?: boolean
}

function monthBounds(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return {
    from: new Date(d.getFullYear(), d.getMonth(), 1),
    to: new Date(d.getFullYear(), d.getMonth() + 1, 0),
  }
}

export function DashboardDateFilter({ value, onApply, disabled }: Props) {
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [error, setError] = useState<string | null>(null)
  const { isMobile } = useSidebar()

  useEffect(() => {
    setFrom(value.from)
    setTo(value.to)
  }, [value.from, value.to])

  const apply = (nextFrom?: Date, nextTo?: Date) => {
    if (nextFrom && nextTo && nextFrom > nextTo) {
      setError("The start date cannot be after the end date.")
      return
    }

    setError(null)
    onApply({
      from: nextFrom,
      to: nextTo,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "default"}
          className="flex items-center gap-2"
          disabled={disabled}
        >
          <Filter />
          {!isMobile && "Filter by date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-full max-w-xs">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!from}
              className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarIcon />
              {from ? format(from, "PPP") : <span>Pick the starting date</span>}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={from} onSelect={setFrom} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!to}
              className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              <CalendarIcon />
              {to ? format(to, "PPP") : <span>Pick the ending date</span>}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={to} onSelect={setTo} />
          </PopoverContent>
        </Popover>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Quick filters</p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                const b = monthBounds(0)
                setFrom(new Date(b.from))
                setTo(new Date(b.to))
                apply(b.from, b.to)
              }}
            >
              This month
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                const b = monthBounds(0)
                setFrom(new Date(b.from))
                setTo(new Date(b.to))
                apply(b.from, b.to)
              }}
            >
              This month
            </Button>
            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                const b = monthBounds(0)
                setFrom(new Date(b.from))
                setTo(new Date(b.to))
                apply(b.from, b.to)
              }}
            >
              This month
            </Button>

            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                const b = monthBounds(-1)
                setFrom(new Date(b.from))
                setTo(new Date(b.to))
                apply(b.from, b.to)
              }}
            >
              Last month
            </Button>

            <Button
              type="button"
              size="xs"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setFrom(undefined)
                setTo(undefined)
                apply(undefined, undefined)
              }}
            >
              All time
            </Button>
          </div>
        </div>

        <Button
          type="button"
          disabled={disabled}
          onClick={() => apply(from, to)}
        >
          Apply
        </Button>
      </PopoverContent>

      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </Popover>
  )
}
