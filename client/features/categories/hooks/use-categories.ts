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

export function useCategories(householdId: string | null) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setCategories([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setCategories(await getCategories(householdId))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load categories."
      )
    } finally {
      setIsLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateCategoryInput) => {
      if (!householdId) throw new Error("No household is selected.")

      const category = await createCategory(householdId, input)
      setCategories((current) => [...current, category])
      return category
    },
    [householdId]
  )

  const update = useCallback(
    async (categoryId: string, input: UpdateCategoryInput) => {
      if (!householdId) throw new Error("No household is selected.")

      const category = await updateCategory(householdId, categoryId, input)
      setCategories((current) =>
        current.map((item) => (item.id === category.id ? category : item))
      )
      return category
    },
    [householdId]
  )

  const remove = useCallback(
    async (categoryId: string) => {
      if (!householdId) throw new Error("No household is selected.")

      await deleteCategory(householdId, categoryId)
      setCategories((current) =>
        current.filter((item) => item.id !== categoryId)
      )
    },
    [householdId]
  )

  return { categories, isLoading, error, refresh, create, update, remove }
}

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
