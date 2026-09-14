"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"

import { CategoryCard } from "./category-card"
import { CategoryForm } from "./category-form"
import { useCategories } from "../hooks/use-categories"

export function CategoriesPage() {
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const { categories, isLoading, error, refresh, create, remove } = useCategories(
    currentHousehold?.id ?? null
  )

  const [isCreating, setIsCreating] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  if (isHouseholdLoading) {
    return <p className="text-sm text-muted-foreground">Loading household...</p>
  }

  if (!currentHousehold) {
    return (
      <div className="rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">No household selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select or create a household before managing categories.
        </p>
      </div>
    )
  }

  async function handleCreate(input: Parameters<typeof create>[0]) {
    setActionError(null)
    try {
      await create(input)
      setIsCreating(false)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create category."
      )
    }
  }

  async function handleDelete(categoryId: string) {
    setDeletingCategoryId(categoryId)
    setActionError(null)

    try {
      await remove(categoryId)
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete category."
      )
    } finally {
      setDeletingCategoryId(null)
    }
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
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>Add category</Button>
        )}
      </div>

      {isCreating && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Create category</h2>
          <CategoryForm
            categories={categories}
            isSubmitting={false}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

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
            <CategoryCard
              key={category.id}
              category={category}
              isDeleting={deletingCategoryId === category.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
