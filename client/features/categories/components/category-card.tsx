"use client"

import { Edit, Loader2 } from "lucide-react"

import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DynamicIcon } from "@/components/common/dynamic-icon"

import {
  useCategories,
  ViewCategory,
  DeleteCategory,
  CategoryFormButton,
  type Category,
} from "@/features/categories"

import { useIsMobile } from "@/hooks/use-mobile"

type CategoryCardProps = {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { remove, isDeleting } = useCategories()
  const isMobile = useIsMobile()

  const handleDelete = async (categoryId: string) => {
    await remove(categoryId)
  }

  return (
    <Item variant="outline">
      <ItemMedia className="shrink-0">
        <DynamicIcon
          icon={category.icon}
          size={20}
          style={{ color: category.color ?? "" }}
        />
      </ItemMedia>

      <ItemContent className="flex-1">
        <ItemTitle
          className={
            "gap-1" + isMobile
              ? "max-[450px]:flex-col max-[450px]:items-start"
              : "flex-wrap"
          }
        >
          <ViewCategory category={category}>
            <span className="cursor-pointer transition-all hover:underline">
              {category.name}
            </span>
          </ViewCategory>

          <div className="flex flex-wrap items-center gap-2">
            {!category.isDefault && !category.parentId ? null : (
              <>
                {category.isDefault && <Badge variant="outline">Default</Badge>}
                {category.parentId && <Badge variant="outline">Nested</Badge>}
              </>
            )}
          </div>
        </ItemTitle>
      </ItemContent>

      <ItemActions>
        <CategoryFormButton category={category}>
          <Button variant="outline" size="icon-sm">
            <Edit />
          </Button>
        </CategoryFormButton>

        <DeleteCategory>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={() => void handleDelete(category.id)}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1 animate-spin" /> Deleting
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DeleteCategory>
      </ItemActions>
    </Item>
  )
}
