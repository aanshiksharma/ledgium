"use client"

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  ReactNode,
} from "react"

import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategories,
  updateCategory,
} from "@/features/categories/api/category-api"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/features/categories"

import { useHousehold } from "./household-provider"

type CategoriesContextValue = {
  categories: Category[]
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (input: CreateCategoryInput) => Promise<void>
  update: (categoryId: string, input: UpdateCategoryInput) => Promise<void>
  remove: (categoryId: string) => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { currentHousehold } = useHousehold()

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentHousehold) {
      setCategories([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setCategories(await getCategories(currentHousehold.id))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load categories."
      )
    } finally {
      setIsLoading(false)
    }
  }, [currentHousehold])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: CreateCategoryInput) => {
      if (!currentHousehold) throw new Error("No household is selected.")

      setIsCreating(true)

      try {
        const category = await createCategory(currentHousehold.id, input)
        setCategories((current) => [...current, category])
      } catch (err) {
        const error =
          err instanceof Error
            ? err.message
            : "Could not create category. Please try again"

        setError(error)
      } finally {
        setIsCreating(false)
        void refresh()
      }
    },
    [currentHousehold]
  )

  const update = useCallback(
    async (categoryId: string, input: UpdateCategoryInput) => {
      if (!currentHousehold) throw new Error("No household is selected.")

      setIsUpdating(true)

      try {
        const category = await updateCategory(
          currentHousehold.id,
          categoryId,
          input
        )
        setCategories((current) =>
          current.map((item) => (item.id === category.id ? category : item))
        )
      } catch (err) {
        const error =
          err instanceof Error
            ? err.message
            : "Could not create category. Please try again"

        setError(error)
      } finally {
        setIsUpdating(false)
        void refresh()
      }
    },
    [currentHousehold]
  )

  const remove = useCallback(
    async (categoryId: string) => {
      if (!currentHousehold) throw new Error("No household is selected.")

      setIsDeleting(true)

      try {
        await deleteCategory(currentHousehold.id, categoryId)
        setCategories((current) =>
          current.filter((item) => item.id !== categoryId)
        )
      } catch (err) {
        const error =
          err instanceof Error
            ? err.message
            : "Could not delete category. Please try again"

        setError(error)
      } finally {
        setIsDeleting(false)
        void refresh()
      }
    },
    [currentHousehold]
  )

  const value = useMemo(
    () => ({
      categories,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      refresh,
      create,
      update,
      remove,
    }),
    [
      categories,
      isLoading,
      isCreating,
      isUpdating,
      isDeleting,
      error,
      refresh,
      create,
      update,
      remove,
    ]
  )

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)

  if (!context)
    throw new Error("useCategories must be used inside a CategoriesProvider")

  return context
}
