import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { JoinHouseholdForm } from "./join-household-form"

export function JoinHouseholdPage() {
  return (
    <section className="flex h-full items-center justify-center">
      <Empty className="gap-8">
        <EmptyHeader>
          <EmptyTitle>Join Existing Household</EmptyTitle>
          <EmptyDescription>
            Enter your household ID to join a household and start managing
            shared finances.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <JoinHouseholdForm />
        </EmptyContent>
      </Empty>
    </section>
  )
}
