import { createError } from 'h3'

export const ERROR_STATUS = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  ACCOUNT_SUSPENDED: 403,
  EMAIL_NOT_VERIFIED: 403,
  ONBOARDING_REQUIRED: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_STATE: 409,
  PAYLOAD_TOO_LARGE: 413,
  FEATURE_DISABLED: 403,
  RATE_LIMITED: 429,
  INTERNAL: 500,
} as const

export type ErrorCode = keyof typeof ERROR_STATUS

export function apiError(code: ErrorCode, message: string, details?: Record<string, unknown>) {
  return createError({
    statusCode: ERROR_STATUS[code],
    statusMessage: code,
    message,
    data: { code, details },
  })
}
