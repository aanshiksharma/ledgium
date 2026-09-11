import { apiRequest } from "@/lib/api/client"
import type {
  AuthResponse,
  AuthUser,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
} from "../types/auth.types"

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function loginWithGoogle(
  input: GoogleLoginInput
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function getCurrentUser(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/me")
}

export async function refreshAccessToken() {
  return apiRequest<AuthResponse>("/auth/refresh", { method: "POST" })
}

export async function logout() {
  return apiRequest<null>("/auth/logout", {
    method: "POST",
  })
}
