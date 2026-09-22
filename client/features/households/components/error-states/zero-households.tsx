import Link from "next/link"

import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export function ZeroHouseholds() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>No Households Found</EmptyTitle>
        <EmptyDescription>
          You are not added in a household at the moment. Create or join one to
          get started.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row justify-center gap-2">
        <Button>
          <Link href="/households/new">Create New Household</Link>
        </Button>

        <Button variant="outline">
          <Link href="/households/join">Join Existing Household</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
