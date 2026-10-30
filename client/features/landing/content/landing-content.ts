import type { LucideIcon } from "lucide-react"
import { ClipboardList, HandCoins, UsersRound } from "lucide-react"

export const landingNavigation = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
] as const

export const problemCards: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: HandCoins,
    title: "The payment",
    description: "Rent, groceries, bills - one person pays the full amount",
  },
  {
    icon: UsersRound,
    title: "The split",
    description:
      "Different people join in, amounts change, and equal splits don't always make sense.",
  },
  {
    icon: ClipboardList,
    title: "The settlement",
    description:
      "With multiple expenses and partial payments, it's easy to lose track of what's settled and what's pending.",
  },
]

export const featureCards: {
  title: string
  description: string
}[] = [
  {
    title: "Track expenses",
    description:
      "Record shared expenses with their amounts, dates, and categories. Keep household spending organized and easy to review.",
  },
  {
    title: "Split expenses",
    description:
      "Choose who shares an expense and how much each person owes. Account for different contributions without forcing every expense into an equal split.",
  },
  {
    title: "Track debts",
    description:
      "See who owes whom and how much remains outstanding. Keep track of obligations as shared expenses add up.",
  },
  {
    title: "Record settlements",
    description:
      "Record repayments and see how they change outstanding balances. Keep a clear history of payments against each debt.",
  },
]

export const workflowSteps = [
  {
    number: "01",
    title: "Create / Join a Household.",
    description:
      "Create a household, invite the people you live with, and give everyone a common place to keep track of shared expenses and balances.",
  },
  {
    number: "02",
    title: "Record Expenses & Splits.",
    description:
      "Record an expense, add who paid, and decide how much each person owes. No more piecing together expenses from chats or trying to remember who paid last time.",
  },
  {
    number: "03",
    title: "Track Debts and Settlements.",
    description:
      "See what each person owes from shared expenses, track outstanding balances, and record payments as debts are settled. Everyone can see where things stand.",
  },
]
