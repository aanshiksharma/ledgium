import { useHousehold } from "@/features/households/hooks/use-household"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "../ui/button"

export function HouseholdSwitcher({ className }: { className?: string }) {
  const {
    households,
    currentHousehold,
    isLoading,
    isCreating,
    selectHousehold,
  } = useHousehold()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        disabled={households.length === 0}
        className={className}
      >
        <Button variant="ghost">
          <div className="leading-none">
            {isLoading
              ? "Loading..."
              : isCreating
                ? "Creating..."
                : currentHousehold
                  ? currentHousehold.name
                  : "No household selected"}
          </div>

          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width)"
        align="start"
      >
        {households.map((household) => (
          <DropdownMenuItem
            key={household.id}
            onSelect={() => selectHousehold(household.id)}
          >
            {household.name}
            {household.id === currentHousehold?.id && (
              <Check className="ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
