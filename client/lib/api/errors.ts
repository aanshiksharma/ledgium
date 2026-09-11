export class ApiError extends Error {
  readonly code?: string
  readonly status: number
  readonly issues?: unknown

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string
      issues?: unknown
    }
  ) {
    super(message)

    this.name = "ApiError"
    this.status = status
    this.code = options?.code
    this.issues = options?.issues
  }

  get isUnauthorized() {
    return this.status === 401
  }

  get isForbidden() {
    return this.status === 403
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
