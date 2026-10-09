import { ElementType } from "react"
import * as Icons from "lucide-react"

import { convertToPascalCase } from "@/lib/utils"

type Props = {
  icon: string | null
} & Icons.LucideProps

export function DynamicIcon({ icon, ...props }: Props) {
  const iconName = convertToPascalCase(icon ?? "")

  const SafeIcon =
    (Icons as unknown as Record<string, ElementType>)[iconName] ||
    Icons.ShoppingBasket

  return <SafeIcon {...props} />
}
