"use client"

import { useCallback, useEffect, useState } from "react"

import {
  addMember as addMemberApi,
  getMembers,
  removeMember as removeMemberApi,
  updateMemberRole as updateMemberRoleApi,
} from "../api/member-api"
import type {
  AddMemberInput,
  UpdateMemberRoleInput,
} from "../types/member.types"
import type { HouseholdMember } from "@/features/households/types/household.types"

export function useMembers(householdId: string | null) {
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!householdId) {
      setMembers([])
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      setMembers(await getMembers(householdId))
    } catch (requestError) {
      setMembers([])
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load household members."
      )
    } finally {
      setIsLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const addMember = useCallback(async (input: AddMemberInput) => {
    if (!householdId) return
    setIsMutating(true)
    setError(null)
    try {
      await addMemberApi(householdId, input)
      await refresh()
    } finally {
      setIsMutating(false)
    }
  }, [householdId, refresh])

  const updateMemberRole = useCallback(async (
    userId: string,
    input: UpdateMemberRoleInput
  ) => {
    if (!householdId) return
    setIsMutating(true)
    setError(null)
    try {
      await updateMemberRoleApi(householdId, userId, input)
      await refresh()
    } finally {
      setIsMutating(false)
    }
  }, [householdId, refresh])

  const removeMember = useCallback(async (userId: string) => {
    if (!householdId) return
    setIsMutating(true)
    setError(null)
    try {
      await removeMemberApi(householdId, userId)
      await refresh()
    } finally {
      setIsMutating(false)
    }
  }, [householdId, refresh])

  return {
    members,
    isLoading,
    isMutating,
    error,
    refresh,
    addMember,
    updateMemberRole,
    removeMember,
  }
}
