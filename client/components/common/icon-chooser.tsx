import { ReactNode } from "react"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ShoppingCart } from "lucide-react"

type Props = {
  children: ReactNode
  value?: string
}

export function IconChooser({ children }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Choose an Icon</PopoverTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>The default icon is</span>
            <figure className="rounded bg-background/40 p-1">
              <ShoppingCart size={16} />
            </figure>
          </div>
        </PopoverHeader>

        <PopoverContent>ye hai content</PopoverContent>
      </PopoverContent>
    </Popover>
  )
}
