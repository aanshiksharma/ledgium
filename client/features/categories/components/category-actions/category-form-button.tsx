"use client"

import { ReactNode, useState } from "react"

import { Loader2 } from "lucide-react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { useIsMobile } from "@/hooks/use-mobile"

import { Category, CategoryForm, useCategories } from "@/features/categories"

type Props = {
  children: ReactNode
  category?: Category
}

export function CategoryFormButton({ children, category }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const isMobile = useIsMobile()

  const { isCreating, isUpdating, isLoading } = useCategories()

  if (isMobile)
    return (
      <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{category ? "Edit" : "Add"} Category</DrawerTitle>
          </DrawerHeader>

          <div className="no-scrollbar max-h-[70vh] overflow-y-auto p-4">
            <CategoryForm
              key={category?.id ?? "new"}
              category={category}
              onSuccess={() => setIsFormOpen(false)}
            />
          </div>

          <DrawerFooter>
            <Button
              type="submit"
              form="category-form"
              disabled={isCreating || isUpdating || isLoading}
            >
              {isCreating || isUpdating || isLoading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  {category ? "Saving Changes" : "Adding Category"}
                </>
              ) : category ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>

            <DrawerClose asChild>
              <Button variant="ghost">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  else
    return (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{category ? "Edit" : "Add"} Category</DialogTitle>
          </DialogHeader>

          <div className="no-scrollbar max-h-[70vh] overflow-y-auto p-1">
            <CategoryForm
              key={category?.id ?? "new"}
              category={category}
              onSuccess={() => setIsFormOpen(false)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" className="flex-1">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              form="category-form"
              disabled={isCreating || isUpdating || isLoading}
              className="flex-1"
            >
              {isCreating || isUpdating || isLoading ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  {category ? "Saving Changes" : "Adding Category"}
                </>
              ) : category ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
}
