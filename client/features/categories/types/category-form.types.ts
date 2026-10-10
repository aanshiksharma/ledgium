import { Category } from "@/features/categories"

export type CategoryFormValues = {
  name: string
  icon: string | null
  color: string | null
  parentId?: string | null
}

export type CategoryFormProps = {
  category?: Category
  onSuccess?: () => void
}
