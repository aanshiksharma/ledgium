"use client"

import {
  useState,
  useMemo,
  useCallback,
  useContext,
  createContext,
  ReactNode,
  useEffect,
} from "react"

import {
  addMember as addMemberApi,
  getMembers,
  removeMember as removeMemberApi,
  updateMemberRole as updateMemberRoleApi,
} from "@/features/members/api/member-api"
import type { AddMemberInput, UpdateMemberRoleInput } from "@/features/members"
import { HouseholdMember, useHousehold } from "@/features/households"

type MembersContextValue = {
  members: HouseholdMember[]
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => void
  addMember: (input: AddMemberInput) => Promise<void>
  updateMemberRole: (
    userId: string,
    input: UpdateMemberRoleInput
  ) => Promise<void>
  removeMember: (userId: string) => Promise<void>
}

const MembersContext = createContext<MembersContextValue | null>(null)

export function MembersProvider({ children }: { children: ReactNode }) {
  const { currentHousehold } = useHousehold()
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!currentHousehold) {
      setMembers([])
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      setMembers(await getMembers(currentHousehold.id))
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
  }, [currentHousehold])

  useEffect(() => void refresh(), [currentHousehold, refresh])

  const addMember = useCallback(
    async (input: AddMemberInput) => {
      if (!currentHousehold) return

      setIsMutating(true)
      setError(null)
      try {
        await addMemberApi(currentHousehold.id, input)
        await refresh()
      } finally {
        setIsMutating(false)
      }
    },
    [currentHousehold, refresh]
  )

  const updateMemberRole = useCallback(
    async (userId: string, input: UpdateMemberRoleInput) => {
      if (!currentHousehold) return
      setIsMutating(true)
      setError(null)
      try {
        await updateMemberRoleApi(currentHousehold.id, userId, input)
        await refresh()
      } finally {
        setIsMutating(false)
      }
    },
    [currentHousehold, refresh]
  )

  const removeMember = useCallback(
    async (userId: string) => {
      if (!currentHousehold) return
      setIsMutating(true)
      setError(null)
      try {
        await removeMemberApi(currentHousehold.id, userId)
        await refresh()
      } finally {
        setIsMutating(false)
      }
    },
    [currentHousehold, refresh]
  )

  const value = useMemo(
    () => ({
      members,
      isLoading,
      isMutating,
      error,
      refresh,
      addMember,
      updateMemberRole,
      removeMember,
    }),
    [
      members,
      error,
      isLoading,
      isMutating,
      addMember,
      refresh,
      removeMember,
      updateMemberRole,
    ]
  )

  return (
    <MembersContext.Provider value={value}>{children}</MembersContext.Provider>
  )
}

export function useMembers() {
  const context = useContext(MembersContext)

  if (!context) {
    throw new Error("useMembers must be used within a MembersProvider.")
  }

  return context
}
