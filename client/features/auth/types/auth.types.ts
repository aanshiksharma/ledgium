export type AuthUser = {
  id: string
  name: string
  email: string
  imageUrl: string | null
  createdAt: string
}

export type AuthResponse = {
  user: AuthUser
}

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

export type GoogleLoginInput = {
  credential: string
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"
