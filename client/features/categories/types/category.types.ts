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
  children?: Category[]
}

export type CreateCategoryInput = {
  name: string
  icon?: string
  color?: string
  parentId?: string | null
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export type CategoryListResponse = {
  categories: Category[]
}

export type CategoryResponse = {
  category: Category
}
