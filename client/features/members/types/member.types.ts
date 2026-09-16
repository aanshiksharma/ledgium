import type {
  HouseholdMember,
  HouseholdRole,
} from "@/features/households/types/household.types"

export type { HouseholdMember, HouseholdRole }

export type AddMemberInput = {
  email: string
  role: "ADMIN" | "MEMBER"
}

export type UpdateMemberRoleInput = {
  role: "ADMIN" | "MEMBER"
}

export type MembersResponse = {
  members: HouseholdMember[]
}

export type AddMemberResponse = {
  member: HouseholdMember
}

export type UpdateMemberRoleResponse = {
  member: HouseholdMember
}
