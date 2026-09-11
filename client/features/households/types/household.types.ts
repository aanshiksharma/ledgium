export type HouseholdRole = "OWNER" | "ADMIN" | "MEMBER"

export type Household = {
  id: string
  name: string
  currency: string
  createdAt: string
  updatedAt: string
}

export type HouseholdMembership = {
  role: HouseholdRole
  joinedAt: string
}

export type HouseholdListItem = Household & {
  members: HouseholdMembership[]
}

export type HouseholdMemberUser = {
  id: string
  name: string
  email: string
  imageUrl: string | null
}

export type HouseholdMember = {
  id: string
  householdId: string
  userId: string
  role: HouseholdRole
  joinedAt: string
  updatedAt: string
  user: HouseholdMemberUser
}

export type CreateHouseholdInput = {
  name: string
  currency?: string
}

export type HouseholdListResponse = {
  households: HouseholdListItem[]
}

export type CreateHouseholdResponse = {
  household: Household
}

export type HouseholdDetailResponse = {
  household: Household
}
