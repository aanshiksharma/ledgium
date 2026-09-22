import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { NewHouseholdForm } from "./new-household-form"

export function NewHouseholdPage() {
  return (
    <section className="flex h-full items-center justify-center">
      <Empty className="gap-8">
        <EmptyHeader>
          <EmptyTitle>Create new household</EmptyTitle>
          <EmptyDescription>
            Create a household to start managing shared finances.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <NewHouseholdForm />
        </EmptyContent>
      </Empty>
    </section>
  )
}
