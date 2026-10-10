"use client"

import { useState } from "react"
import { ListPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NoCurrentHousehold, useHousehold } from "@/features/households"

import {
  useCategories,
  CategoryCard,
  CategoryFormButton,
} from "@/features/categories"
import { useIsMobile } from "@/hooks/use-mobile"
import { LoadingHousehold } from "@/features/households"

export function CategoriesPage() {
  const {
    households,
    currentHousehold,
    isLoading: isHouseholdLoading,
  } = useHousehold()
  const { categories, isLoading, error, refresh, create, remove } =
    useCategories()

  const [actionError, setActionError] = useState<string | null>(null)

  const isMobile = useIsMobile()

  if (isHouseholdLoading) return <LoadingHousehold />

  if (!currentHousehold) {
    return <NoCurrentHousehold households={households} />
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the categories belonging to {currentHousehold.name}.
          </p>
        </div>

        <CategoryFormButton>
          {isMobile ? (
            <Button size="icon">
              <ListPlus />
            </Button>
          ) : (
            <Button>Add Category</Button>
          )}
        </CategoryFormButton>
      </div>

      {(error || actionError) && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <span>{actionError ?? error}</span>
          {error && !actionError && (
            <Button variant="outline" size="sm" onClick={() => void refresh()}>
              Retry
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <h2 className="font-medium">No categories yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first category to organize household transactions.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  )
}
