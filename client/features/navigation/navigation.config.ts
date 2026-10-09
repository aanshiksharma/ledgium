import {
  CreditCard,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
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

export type NavigationGroup = {
  title?: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/overview",
        icon: LayoutDashboard,
        enabled: true,
      },
    ],
  },
  {
    title: "Household",
    items: [
      {
        label: "Expenses",
        href: "/expenses",
        icon: ReceiptText,
        enabled: true,
      },
      {
        label: "Debts",
        href: "/debts-and-settlements",
        icon: HandCoins,
        enabled: true,
      },
      {
        label: "Settlements",
        href: "/settlements",
        icon: HandCoins,
        enabled: false,
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
        enabled: true,
      },
    ],
  },
  {
    title: "General",
    items: [
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        enabled: false,
      },
    ],
  },
]
