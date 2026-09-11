"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useAuth } from "@/providers/auth-provider"
import {
  createHousehold as createHouseholdRequest,
  getHouseholds,
} from "@/features/households/api/household-api"

import type {
  CreateHouseholdInput,
  Household,
  HouseholdListItem,
} from "@/features/households/types/household.types"

const STORAGE_KEY = "ledgium.currentHouseholdId"

type HouseholdContextValue = {
  households: HouseholdListItem[]
  currentHousehold: HouseholdListItem | null
  isLoading: boolean
  isCreating: boolean
  error: string | null
  refresh: () => Promise<void>
  selectHousehold: (householdId: string) => void
  createHousehold: (input: CreateHouseholdInput) => Promise<Household>
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(
  undefined
)

type HouseholdProviderProps = { children: React.ReactNode }

export function HouseholdProvider({ children }: HouseholdProviderProps) {
  const { status } = useAuth()
  const [households, setHouseholds] = useState<HouseholdListItem[]>([])
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectHousehold = useCallback((householdId: string) => {
    setCurrentHouseholdId(householdId)
    window.localStorage.setItem(STORAGE_KEY, householdId)
  }, [])

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setHouseholds([])
      setCurrentHouseholdId(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const nextHouseholds = await getHouseholds()
      setHouseholds(nextHouseholds)

      const storedHouseholdId = window.localStorage.getItem(STORAGE_KEY)

      const storedHousehold = storedHouseholdId
        ? nextHouseholds.find((household) => household.id === storedHouseholdId)
        : undefined

      const selectedHousehold = storedHousehold ?? nextHouseholds[0] ?? null

      if (selectedHousehold) {
        setCurrentHouseholdId(selectedHousehold.id)
        window.localStorage.setItem(STORAGE_KEY, selectedHousehold.id)
      } else {
        setCurrentHouseholdId(null)
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load households."
      )
    } finally {
      setIsLoading(false)
    }
  }, [status])

  const createHousehold = useCallback(
    async (input: CreateHouseholdInput) => {
      setIsCreating(true)
      setError(null)

      try {
        const household = await createHouseholdRequest(input)
        /* * Refresh instead of manually constructing a HouseholdListItem. * The list endpoint is authoritative and includes the authenticated * user's membership information. */
        await refresh()

        selectHousehold(household.id)

        return household
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Failed to create household."
        setError(message)
        throw requestError
      } finally {
        setIsCreating(false)
      }
    },
    [refresh, selectHousehold]
  )

  useEffect(() => {
    if (status === "authenticated") {
      void refresh()
      return
    }
    if (status === "unauthenticated") {
      setHouseholds([])
      setCurrentHouseholdId(null)
      setError(null)
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [status, refresh])

  const currentHousehold = useMemo(
    () =>
      households.find((household) => household.id === currentHouseholdId) ??
      null,
    [households, currentHouseholdId]
  )

  const value = useMemo<HouseholdContextValue>(
    () => ({
      households,
      currentHousehold,
      isLoading,
      isCreating,
      error,
      refresh,
      selectHousehold,
      createHousehold,
    }),
    [
      households,
      currentHousehold,
      isLoading,
      isCreating,
      error,
      refresh,
      selectHousehold,
      createHousehold,
    ]
  )
  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const context = useContext(HouseholdContext)
  if (!context) {
    throw new Error("useHousehold must be used within a HouseholdProvider.")
  }
  return context
}
