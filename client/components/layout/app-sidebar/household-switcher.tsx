import { useHousehold } from "@/features/households/hooks/use-household"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { ChevronsUpDown, Check, House } from "lucide-react"

export function HouseholdSwitcher() {
  const {
    households,
    currentHousehold,
    isLoading,
    isCreating,
    selectHousehold,
  } = useHousehold()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={households.length === 0}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <House className="size-4" />
              </div>

              <div className="flex flex-col gap-1 leading-none">
                <span className="">Ledgium</span>
                <span className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Loading..."
                    : isCreating
                      ? "Creating..."
                      : currentHousehold
                        ? currentHousehold.name
                        : "No household selected"}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
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
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
