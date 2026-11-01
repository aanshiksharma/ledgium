export { cn } from "cn"
export * from "./date-utils"
export * from "./text-utils"

export const money = (value: number | string | null, currency: string) =>
  value == null
    ? "—"
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value))

export const getCurrency = (currency: string) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  })

  const parts = formatter.formatToParts(1)
  const symbolPart = parts.find((part) => part.type === "currency")

  return symbolPart ? symbolPart.value : null
}
