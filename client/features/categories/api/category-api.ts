import { apiRequest } from "@/lib/api/client"
import type {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category.types"

function basePath(householdId: string) {
  return `/households/${householdId}/categories`
}

export async function getCategories(householdId: string) {
  const response = await apiRequest<CategoryListResponse>(basePath(householdId))
  return response.categories
}

export async function getCategory(householdId: string, categoryId: string) {
  const response = await apiRequest<CategoryResponse>(
    `${basePath(householdId)}/${categoryId}`
  )
  return response.category
}

export async function createCategory(
  householdId: string,
  input: CreateCategoryInput
) {
  const response = await apiRequest<CategoryResponse>(basePath(householdId), {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.category
}

export async function updateCategory(
  householdId: string,
  categoryId: string,
  input: UpdateCategoryInput
) {
  const response = await apiRequest<CategoryResponse>(
    `${basePath(householdId)}/${categoryId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  )
  return response.category
}

export async function deleteCategory(
  householdId: string,
  categoryId: string
) {
  await apiRequest<void>(`${basePath(householdId)}/${categoryId}`, {
    method: "DELETE",
  })
}
