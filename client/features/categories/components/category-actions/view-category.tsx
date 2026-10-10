"use client"

import chroma from "chroma-js"
import { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { ColorPicker, ColorPickerSwatch } from "@/components/ui/color-picker"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { DynamicIcon } from "@/components/common/dynamic-icon"

import {
  DeleteCategory,
  useCategories,
  type Category,
} from "@/features/categories"
import { CategoryFormButton } from "./category-form-button"

type Props = { children: ReactNode; category: Category }

export function ViewCategory({ children, category }: Props) {
  const colorValue = chroma(
    getComputedStyle(document.documentElement).getPropertyValue("--foreground")
  ).hex()

  const { categories, remove } = useCategories()

  const parentName = category.parentId
    ? categories.find((cat) => cat.id === category.parentId)!.name
    : `${category.name} has no parent category`

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Category</DialogTitle>
        </DialogHeader>

        <div className="no-scrollbar max-h-[70vh] space-y-6 overflow-y-auto p-2">
          <div className="grid gap-6">
            <div className="flex gap-2 max-[32rem]:flex-col min-[32rem]:items-center">
              <Label className="min-[32rem]:basis-36">Category Name</Label>
              <p className="text-muted-foreground">{category.name}</p>
            </div>

            <div className="flex gap-2 max-[32rem]:flex-col min-[32rem]:items-center">
              <Label className="min-[32rem]:basis-36">Parent Category</Label>
              <p className="text-muted-foreground">{parentName}</p>
            </div>

            <div className="flex gap-2 max-[32rem]:flex-col min-[32rem]:items-center">
              <Label className="min-[32rem]:basis-36">Badges</Label>
              <div className="flex items-center gap-1">
                {!category.isDefault && !category.parentId ? (
                  "No badges"
                ) : (
                  <>
                    {category.isDefault && (
                      <Badge variant="outline">Default</Badge>
                    )}
                    {category.parentId && (
                      <Badge variant="outline">Nested</Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Item variant="muted" className="items-start">
              <ItemMedia>
                <ColorPicker
                  defaultValue={colorValue}
                  value={
                    category.color?.trim()
                      ? chroma(category.color?.trim()).hex()
                      : colorValue
                  }
                >
                  <ColorPickerSwatch className="size-9" />
                </ColorPicker>
              </ItemMedia>

              <ItemContent>
                <ItemTitle>Current Color</ItemTitle>
                <ItemDescription className="text-sm">
                  {category.color ?? "No color selected"}
                </ItemDescription>
              </ItemContent>
            </Item>

            <Item variant="muted" className="items-start">
              <ItemMedia>
                <figure className="flex size-10 items-center justify-center rounded-md bg-muted">
                  <DynamicIcon icon={category.icon} size={24} />
                </figure>
              </ItemMedia>

              <ItemContent>
                <ItemTitle>Icon Name</ItemTitle>
                <ItemDescription className="text-sm">
                  {category.icon ?? "shopping-bag (default)"}
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>

          <div className="space-y-4">
            <Label>Child Categories</Label>
            {category.children.length === 0 ? (
              <div className="w-full rounded-2xl px-4 py-8 ring ring-border">
                <p className="text-center text-muted-foreground">
                  {category.name} has no child categories associated to it
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {category.children.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-muted/50"
                  >
                    <DynamicIcon icon={cat.icon} size={20} />
                    <p>{cat.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="max-md:flex-row">
          <CategoryFormButton category={category}>
            <Button variant="outline" className="flex-1">
              Edit
            </Button>
          </CategoryFormButton>

          <DeleteCategory size="icon">
            <Button variant="destructive" onClick={() => remove(category.id)}>
              Delete
            </Button>
          </DeleteCategory>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
