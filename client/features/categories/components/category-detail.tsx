"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useHousehold } from "@/providers/household-provider"

import { deleteCategory, updateCategory } from "../api/category-api"
import { CategoryForm } from "./category-form"
import { useCategories, useCategory } from "../hooks/use-categories"
import type { CreateCategoryInput } from "../types/category.types"

export function CategoryDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { currentHousehold, isLoading: isHouseholdLoading } = useHousehold()
  const { categories, refresh: refreshCategories } = useCategories(
    currentHousehold?.id ?? null
  )
  const { category, setCategory, isLoading, error, refresh } = useCategory(
    currentHousehold?.id ?? null,
    params?.id ?? null
  )

  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading category...</p>
  }

  if (!category) {
    return (
      <div className="space-y-4">
        <Link href="/categories" className="text-sm hover:underline">
          ← Back to categories
        </Link>
        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">Category not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {actionError ?? error ?? "This category could not be loaded."}
          </p>
        </div>
      </div>
    )
  }

  const householdId = currentHousehold.id
  const categoryId = category.id
  const categoryName = category.name

  async function handleUpdate(input: CreateCategoryInput) {
    setIsSubmitting(true)
    setActionError(null)

    try {
      const updated = await updateCategory(householdId, categoryId, input)
      setCategory(updated)
      setIsEditing(false)
      await refresh()
      await refreshCategories()
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update category."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${categoryName}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteCategory(householdId, categoryId)
      router.push("/categories")
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete category."
      )
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <Link href="/categories" className="text-sm hover:underline">
        ← Back to categories
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-4 rounded-full border"
              style={
                category.color ? { backgroundColor: category.color } : undefined
              }
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              {category.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {category.isDefault ? "Default category" : "Custom category"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setActionError(null)
              setIsEditing((current) => !current)
            }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void handleDelete()}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {(error || actionError) && (
        <div className="rounded-xl border border-destructive/30 p-4 text-sm">
          {actionError ?? error}
        </div>
      )}

      {isEditing ? (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit category</h2>
          <CategoryForm
            categories={categories}
            category={category}
            isSubmitting={isSubmitting}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Icon</dt>
                <dd>{category.icon || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Color</dt>
                <dd>{category.color || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Parent</dt>
                <dd>{category.parentId || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd>{new Date(category.createdAt).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{new Date(category.updatedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold">Children</h2>
            {category.children?.length ? (
              <ul className="mt-4 space-y-2">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.id}`}
                      className="text-sm hover:underline"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No child categories.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
