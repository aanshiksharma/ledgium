"use client"

import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { Category, CreateCategoryInput } from "../types/category.types"

type CategoryFormProps = {
  categories: Category[]
  category?: Category | null
  isSubmitting: boolean
  onSubmit: (input: CreateCategoryInput) => Promise<void>
  onCancel: () => void
}

function flattenCategories(
  categories: Category[],
  excludedIds: Set<string>,
  depth = 0
): Array<{ category: Category; depth: number }> {
  return categories.flatMap((category) => {
    if (excludedIds.has(category.id)) return []

    return [
      { category, depth },
      ...flattenCategories(category.children ?? [], excludedIds, depth + 1),
    ]
  })
}

function collectDescendantIds(category: Category): Set<string> {
  const ids = new Set<string>()

  function visit(item: Category) {
    for (const child of item.children ?? []) {
      ids.add(child.id)
      visit(child)
    }
  }

  visit(category)
  return ids
}

export function CategoryForm({
  categories,
  category,
  isSubmitting,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "")
  const [icon, setIcon] = useState(category?.icon ?? "")
  const [color, setColor] = useState(category?.color ?? "")
  const [parentId, setParentId] = useState(category?.parentId ?? "")

  useEffect(() => {
    setName(category?.name ?? "")
    setIcon(category?.icon ?? "")
    setColor(category?.color ?? "")
    setParentId(category?.parentId ?? "")
  }, [category])

  const excludedIds = useMemo(() => {
    const ids = new Set<string>()
    if (category) {
      ids.add(category.id)
      for (const id of collectDescendantIds(category)) ids.add(id)
    }
    return ids
  }, [category])

  const parentOptions = useMemo(
    () =>
      flattenCategories(
        categories.filter((item) => item.parentId === null),
        excludedIds
      ),
    [categories, excludedIds]
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onSubmit({
      name: name.trim(),
      ...(icon.trim() ? { icon: icon.trim() } : {}),
      ...(color.trim() ? { color: color.trim() } : {}),
      parentId: parentId || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          value={name}
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Groceries"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-icon">Icon</Label>
          <Input
            id="category-icon"
            value={icon}
            maxLength={50}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="e.g. shopping-cart"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-color">Color</Label>
          <Input
            id="category-color"
            value={color}
            maxLength={20}
            onChange={(event) => setColor(event.target.value)}
            placeholder="e.g. #22c55e"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-parent">Parent category</Label>
        <select
          id="category-parent"
          value={parentId}
          onChange={(event) => setParentId(event.target.value)}
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {parentOptions.map(({ category: option, depth }) => (
            <option key={option.id} value={option.id}>
              {"— ".repeat(depth)}
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting
            ? "Saving..."
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
