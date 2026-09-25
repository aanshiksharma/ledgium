"use client"

import { useMemo, useState } from "react"

import {
  LayoutGrid,
  ListPlus,
  SlidersHorizontal,
  TextAlignJustify,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { ProgressBar } from "@/components/common/progress-bar"

import { useIsMobile } from "@/hooks/use-mobile"

import {
  useHouseholdExpenses,
  HouseholdExpenseList,
} from "@/features/household-expenses"
import { useHousehold, NoCurrentHousehold } from "@/features/households"
import { HouseholdExpenseFormButton } from "./household-expense-form-button"
import { ButtonGroup } from "@/components/ui/button-group"

export function HouseholdExpensesPage() {
  const {
    currentHousehold,
    households,
    isLoading: householdLoading,
  } = useHousehold()

  const isMobile = useIsMobile()

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [offset, setOffset] = useState(0)

  const filters = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      limit: 50,
      offset,
    }),
    [from, to, offset]
  )

  const { total, isLoading, isSubmitting, error, refresh } =
    useHouseholdExpenses(currentHousehold?.id ?? null, filters)

  if (householdLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <ProgressBar
          loading={householdLoading}
          loadingText="Loading Household..."
        />
      </div>
    )

  if (!currentHousehold) return <NoCurrentHousehold households={households} />

  return (
    <>
      <section className="flex flex-col gap-4 lg:gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Manage Expenses
          </h1>
        </header>

        <div className="flex items-center gap-2">
          <Field className="flex-1">
            <Input placeholder="Search expenses..." />
          </Field>

          <Button variant="outline" size="icon">
            <SlidersHorizontal />
          </Button>

          <ButtonGroup>
            <Button
              variant={viewMode === "grid" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <TextAlignJustify />
            </Button>
          </ButtonGroup>

          <HouseholdExpenseFormButton
            isSubmitting={isSubmitting}
            currentHousehold={currentHousehold}
          >
            {isMobile ? (
              <Button size="icon">
                <ListPlus />
              </Button>
            ) : (
              <Button>Add Expense</Button>
            )}
          </HouseholdExpenseFormButton>
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{error}</span>
          <Button variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      )}

      <HouseholdExpenseList
        viewMode={viewMode}
        currentHousehold={currentHousehold}
      />

      {
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={offset === 0 || isLoading}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Showing {offset + 1}–{Math.min(offset + 50, total)} of {total}
          </span>

          <Button
            variant="outline"
            disabled={offset + 50 >= total || isLoading}
            onClick={() => setOffset(offset + 50)}
          >
            Next
          </Button>
        </div>
      }
    </>
  )
}
