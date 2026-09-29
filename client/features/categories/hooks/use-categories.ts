"use client"

import { useCallback, useEffect, useState } from "react"

import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "../api/category-api"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types"

export { useCategories } from "@/providers"

export function useCategory(
  householdId: string | null,
  categoryId: string | null
) {
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId || !categoryId) {
      setCategory(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setCategory(await getCategory(householdId, categoryId))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load category."
      )
    } finally {
      setIsLoading(false)
    }
  }, [householdId, categoryId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { category, setCategory, isLoading, error, refresh }
}
