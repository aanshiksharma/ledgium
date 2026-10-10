import { Category } from "@/features/categories"

export function flattenCategories(
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

export function collectDescendantIds(category: Category): Set<string> {
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
