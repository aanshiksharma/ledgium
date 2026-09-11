import { apiRequest } from "@/lib/api/client"
import type {
  CreateHouseholdInput,
  CreateHouseholdResponse,
  HouseholdDetailResponse,
  HouseholdListResponse,
} from "../types/household.types"

export async function getHouseholds() {
  const response = await apiRequest<HouseholdListResponse>("/households")
  return response.households
}

export async function getHousehold(householdId: string) {
  const response = await apiRequest<HouseholdDetailResponse>(
    `/households/${householdId}`
  )
  return response.household
}

export async function createHousehold(input: CreateHouseholdInput) {
  const response = await apiRequest<CreateHouseholdResponse>("/households", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return response.household
}
