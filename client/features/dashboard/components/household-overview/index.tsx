import { HouseholdDetails } from "./household-details"
import { DebtsOverview } from "./debts-overview"
import { RecentExpenses } from "./recent-expenses"
import { Household } from "@/features/households"

export function HouseholdOverview() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_3fr] lg:gap-6">
        <HouseholdDetails />

        <DebtsOverview />
      </section>

      <RecentExpenses />
    </div>
  )
}
