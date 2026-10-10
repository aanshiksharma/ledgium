"use client"

import { Controller, FormProvider } from "react-hook-form"
import { Ungroup } from "lucide-react"
import chroma from "chroma-js"

import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerContent,
  ColorPickerSwatch,
  ColorPickerTrigger,
  ColorPickerInput,
} from "@/components/ui/color-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconPicker, IconName } from "@/components/ui/icon-picker"
import { DynamicIcon } from "@/components/common/dynamic-icon"

import { CategoryFormProps, useCategoriesForm } from "@/features/categories"

export function CategoryForm(props: CategoryFormProps) {
  const { categories, form, values, submit } = useCategoriesForm(props)
  const { control } = form

  const colorValue = chroma(
    getComputedStyle(document.documentElement).getPropertyValue("--foreground")
  ).hex()

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} id="category-form">
        <FieldGroup>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid}>
                <FieldLabel>Name</FieldLabel>
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. Groceries"
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="parentId"
            render={({ field, fieldState }) => {
              return (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Parent Category</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      if (value) field.onChange(value)
                    }}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select an existing category" />
                      <SelectContent>
                        {categories.map((option) => (
                          <SelectItem
                            key={option.category.id}
                            value={option.category.id}
                          >
                            {Array.from(new Array(option.depth)).map(
                              (_, index) => (
                                <Ungroup key={index} />
                              )
                            )}
                            {option.category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                </Field>
              )
            }}
          />

          <div className="flex items-start gap-4">
            <Controller
              control={control}
              name="color"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Color</FieldLabel>

                  <ColorPicker
                    aria-invalid={fieldState.invalid}
                    value={field.value ?? colorValue}
                    onValueChange={field.onChange}
                    defaultFormat="hex"
                    className="gap-4"
                  >
                    <div className="grid gap-3">
                      <div className="flex items-center gap-4">
                        <ColorPickerSwatch className="size-10" />
                        <p>{field.value ?? colorValue + " (default)"}</p>
                      </div>

                      <ColorPickerTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Pick Color
                        </Button>
                      </ColorPickerTrigger>
                    </div>

                    <ColorPickerContent>
                      <ColorPickerArea />
                      <div className="flex items-center gap-2">
                        <ColorPickerEyeDropper />
                        <div className="flex flex-1 flex-col gap-2">
                          <ColorPickerHueSlider />
                          <ColorPickerAlphaSlider />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ColorPickerFormatSelect />
                        <ColorPickerInput />
                      </div>
                    </ColorPickerContent>
                  </ColorPicker>
                </Field>
              )}
            />

            <Controller
              control={control}
              name="icon"
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Icon</FieldLabel>

                  <div className="flex items-center gap-4">
                    <figure className="flex size-10 items-center justify-center rounded-md bg-muted p-1">
                      <DynamicIcon icon={field.value} />
                    </figure>

                    <p>{field.value}</p>
                  </div>

                  <IconPicker
                    value={field.value ? (field.value as IconName) : undefined}
                    onValueChange={field.onChange}
                  >
                    <Button variant="outline">Choose Icon</Button>
                  </IconPicker>
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </form>
    </FormProvider>
  )
}
