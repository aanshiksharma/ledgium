import { ApiError } from "./errors"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"

type ApiErrorPayload = {
  code?: string
  message?: string
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  error?: ApiErrorPayload | string
  issues?: Record<string, string[]>
}

const AUTH_BYPASS_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/google",
]

let refreshTokenPromise: Promise<boolean> | null = null

async function performTokenRefresh(): Promise<boolean> {
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  refreshTokenPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        return false
      }

      let body: ApiEnvelope<unknown> | null = null
      try {
        body = (await response.json()) as ApiEnvelope<unknown>
      } catch {
        body = null
      }

      return body?.success === true
    } catch {
      return false
    } finally {
      refreshTokenPromise = null
    }
  })()

  return refreshTokenPromise
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  isRetry = false
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    credentials: "include",
  })

  if (
    response.status === 401 &&
    !isRetry &&
    !AUTH_BYPASS_PATHS.includes(path)
  ) {
    const refreshed = await performTokenRefresh()
    if (refreshed) {
      return apiRequest<T>(path, init, true)
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  let body: ApiEnvelope<T> | null = null

  try {
    body = (await response.json()) as ApiEnvelope<T>
  } catch {
    body = null
  }

  const errorPayload = body?.error

  const errorMessage =
    typeof errorPayload === "string"
      ? errorPayload
      : (errorPayload?.message ?? "The server returned an invalid response.")

  const errorCode =
    typeof errorPayload === "object" ? errorPayload?.code : undefined

  if (!response.ok) {
    throw new ApiError(errorMessage, response.status, {
      code: errorCode,
      issues: body?.issues,
    })
  }

  if (!body?.success || body.data === undefined) {
    throw new ApiError(errorMessage, response.status, {
      code: errorCode,
      issues: body?.issues,
    })
  }

  return body.data
}

export function getApiBaseUrl() {
  return API_BASE_URL
}
