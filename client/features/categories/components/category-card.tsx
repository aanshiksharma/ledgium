import Link from "next/link"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { Category } from "../types/category.types"

type CategoryCardProps = {
  category: Category
  onDelete: (categoryId: string) => Promise<void>
  isDeleting: boolean
}

export function CategoryCard({
  category,
  onDelete,
  isDeleting,
}: CategoryCardProps) {
  const childCount = category.children?.length ?? 0

  async function handleDelete() {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) {
      return
    }

    await onDelete(category.id)
  }

  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1 size-3 shrink-0 rounded-full border"
            style={category.color ? { backgroundColor: category.color } : undefined}
          />
          <div className="min-w-0">
            <Link
              href={`/categories/${category.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {category.name}
            </Link>
            {category.parentId && (
              <p className="mt-1 text-sm text-muted-foreground">
                Nested category
              </p>
            )}
          </div>
        </div>

        {category.isDefault && (
          <span className="rounded-full border px-2.5 py-1 text-xs">
            Default
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {childCount} {childCount === 1 ? "child" : "children"}
        </span>
        {category.icon && <span>{category.icon}</span>}
      </div>

      <div className="mt-5 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/categories/${category.id}`}>Details</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDeleting}
          onClick={() => void handleDelete()}
        >
          <Trash2 />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </article>
  )
}
