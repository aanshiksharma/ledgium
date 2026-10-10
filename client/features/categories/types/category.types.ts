export type Category = {
  id: string
  householdId: string
  name: string
  icon: string | null
  color: string | null
  parentId: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
  children: Category[]
}

export type CategoryInput = {
  name: string
  icon?: string
  color?: string
  parentId?: string | null
}

export type CreateCategoryInput = CategoryInput
export type UpdateCategoryInput = CategoryInput

export type CategoryListResponse = {
  categories: Category[]
}

export type CategoryResponse = {
  category: Category
}
