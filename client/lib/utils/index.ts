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
