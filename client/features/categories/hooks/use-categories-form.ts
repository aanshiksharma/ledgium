"use client"

import { useEffect, useMemo, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"

import {
  useCategories,
  collectDescendantIds,
  flattenCategories,
} from "@/features/categories"

import {
  Category,
  CategoryFormValues,
  CategoryFormProps,
  CategoryInput,
} from "@/features/categories"

function createDefaultFormValues(): CategoryFormValues {
  return {
    name: "",
    icon: "",
    color: "",
    parentId: "",
  }
}

function createEditFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    icon: category.icon,
    color: category.color,
    parentId: category.parentId,
  }
}

export function useCategoriesForm({ category, onSuccess }: CategoryFormProps) {
  const initializedCategoryIdRef = useRef<string | null>(null)

  const { categories, create, update, refresh } = useCategories()

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

  const form = useForm<CategoryFormValues>({
    defaultValues: createDefaultFormValues(),
  })

  const { control, reset, setError, clearErrors } = form

  // Resets the form with values of current category
  useEffect(() => {
    const categoryId = category?.id ?? null

    if (initializedCategoryIdRef.current === categoryId) return

    initializedCategoryIdRef.current = categoryId

    reset(category ? createEditFormValues(category) : createDefaultFormValues())
  }, [category, reset])

  const name = useWatch({ control, name: "name" })
  const color = useWatch({ control, name: "color" })
  const icon = useWatch({ control, name: "icon" })
  const parentId = useWatch({ control, name: "parentId" })

  const submit = form.handleSubmit(async (formValues) => {
    clearErrors("root")

    const name = formValues.name.trim()
    const color = formValues.color?.trim()
    const icon = formValues.icon?.trim()
    const parentId = formValues.parentId?.trim()

    if (!name) {
      setError("name", { message: "Category name is required." })
      return
    }

    const input: CategoryInput = {
      name,
      color,
      icon,
      parentId,
    }

    try {
      if (category) await update(category.id, input)
      else await create(input)

      onSuccess?.()
      await refresh()
    } catch (error) {
      console.error(
        error instanceof Error
          ? error.message
          : "Unexpected error occurred while saving"
      )
    }
  })

  return {
    form,
    categories: parentOptions,
    values: {
      name,
      color,
      icon,
      parentId,
    },
    submit,
  }
}
