import {
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Settings,
  Tags,
  Users,
} from "lucide-react"

export type NavigationItem = {
  label: string
  href: string
  icon: typeof LayoutDashboard
  enabled: boolean
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: CreditCard,
    enabled: true,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ListChecks,
    enabled: true,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Tags,
    enabled: true,
  },
  {
    label: "Members",
    href: "/members",
    icon: Users,
    enabled: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    enabled: false,
  },
]
