"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { ApiError } from "@/lib/api/errors"

import {
  login,
  loginWithGoogle,
  register,
  getCurrentUser,
  logout as logoutApi,
} from "@/features/auth/api/auth-api"
import type {
  AuthResponse,
  AuthStatus,
  AuthUser,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
} from "@/features/auth/types/auth.types"

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  isLoading: boolean
  login: (input: LoginInput) => Promise<AuthResponse>
  register: (input: RegisterInput) => Promise<AuthResponse>
  loginWithGoogle: (input: GoogleLoginInput) => Promise<AuthResponse>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  const refresh = useCallback(async () => {
    setStatus("loading")

    try {
      const result = await getCurrentUser()

      setUser(result.user)
      setStatus("authenticated")
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        setUser(null)
        setStatus("unauthenticated")
        return
      }

      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const authenticate = useCallback(
    async (request: () => Promise<AuthResponse>): Promise<AuthResponse> => {
      const result = await request()

      setUser(result.user)
      setStatus("authenticated")

      return result
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } finally {
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isLoading: status === "loading",
      login: (input) => authenticate(() => login(input)),
      register: (input) => authenticate(() => register(input)),
      loginWithGoogle: (input) => authenticate(() => loginWithGoogle(input)),
      logout,
      refresh,
    }),
    [authenticate, logout, refresh, status, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.")
  }

  return context
}
