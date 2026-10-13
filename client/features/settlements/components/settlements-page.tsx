"use client"

import { SlidersHorizontal, RefreshCcw } from "lucide-react"

import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useDebts } from "@/features/debts"
import { SettlementHistory } from "@/features/settlements"

export function SettlementsPage() {
  const { isLoading, isSubmitting, refresh } = useDebts()

  return (
    <>
      <section className="flex flex-col gap-4 lg:gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Settlement History
          </h1>
        </header>

        <section className="flex items-center gap-2">
          <Field className="flex-1">
            <Input placeholder="Search settlements..." />
          </Field>

          <Button variant="outline" size="icon">
            <SlidersHorizontal />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => void refresh()}
            disabled={isLoading || isSubmitting}
          >
            <RefreshCcw className={isLoading ? "animate-spin" : ""} />
          </Button>
        </section>
      </section>

      <SettlementHistory />
    </>
  )
}
