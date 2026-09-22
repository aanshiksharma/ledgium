import { HouseholdDetails } from "./household-details"
import { DebtsOverview } from "./debts-overview"
import { RecentExpenses } from "./recent-expenses"

type Props = {
  currentHouseholdId: string
}

export function HouseholdOverview({ currentHouseholdId }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_3fr] lg:gap-6">
        <HouseholdDetails currentHouseholdId={currentHouseholdId} />

        <DebtsOverview currentHouseholdId={currentHouseholdId} />
      </section>

      <RecentExpenses currentHouseholdId={currentHouseholdId} />
    </div>
  )
}
