import Link from "next/link"

import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

import { useHousehold } from "@/providers"
import { Household } from "@/features/households"

type Props = {
  households: Household[]
}

export function NoCurrentHousehold({ households }: Props) {
  const { selectHousehold } = useHousehold()

  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>No household selected</EmptyTitle>
        <EmptyDescription>
          Please select a household to continue
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Select
          defaultValue={""}
          onValueChange={(value) => {
            selectHousehold(value)
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Choose a Household" />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectGroup>
              {households.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
              <SelectItem value="create">
                <Link href="/households/new">Create New Household</Link>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </EmptyContent>
    </Empty>
  )
}
