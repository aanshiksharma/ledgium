import { apiRequest } from "@/lib/api/client"

import type {
  AddMemberInput,
  AddMemberResponse,
  MembersResponse,
  UpdateMemberRoleInput,
  UpdateMemberRoleResponse,
} from "../types/member.types"

export async function getMembers(householdId: string) {
  const response = await apiRequest<MembersResponse>(
    `/households/${householdId}/members`
  )
  return response.members
}

export async function addMember(
  householdId: string,
  input: AddMemberInput
) {
  const response = await apiRequest<AddMemberResponse>(
    `/households/${householdId}/members`,
    { method: "POST", body: JSON.stringify(input) }
  )
  return response.member
}

export async function updateMemberRole(
  householdId: string,
  userId: string,
  input: UpdateMemberRoleInput
) {
  const response = await apiRequest<UpdateMemberRoleResponse>(
    `/households/${householdId}/members/${userId}`,
    { method: "PATCH", body: JSON.stringify(input) }
  )
  return response.member
}

export async function removeMember(householdId: string, userId: string) {
  await apiRequest<void>(
    `/households/${householdId}/members/${userId}`,
    { method: "DELETE" }
  )
}
