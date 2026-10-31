import type { NitroErrorHandler } from 'nitropack'
import { getResponseHeader, setResponseHeader, setResponseStatus, send } from 'h3'
import { ERROR_STATUS, type ErrorCode } from './utils/api-error'

// Formats every /api error into the Clautverse error envelope (review §1.2).
export default <NitroErrorHandler> function (error, event) {
  const status = error.statusCode || 500
  const data = (error.data ?? {}) as { code?: ErrorCode, details?: Record<string, unknown> }
  let code: ErrorCode = data.code && data.code in ERROR_STATUS
    ? data.code
    : status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 405 ? 'NOT_FOUND' : status < 500 ? 'VALIDATION_FAILED' : 'INTERNAL'
  if (status >= 500) code = 'INTERNAL'
  const requestId = (event.context.requestId as string | undefined) ?? (getResponseHeader(event, 'x-request-id') as string | undefined) ?? null
  if (status >= 500) console.error(`[${requestId}]`, error)
  const message = status >= 500 ? 'Something went wrong.' : (error.message || 'Request failed.')
  setResponseStatus(event, status)
  setResponseHeader(event, 'content-type', 'application/json')
  return send(event, JSON.stringify({
    error: { code, message, requestId, ...(status < 500 && data.details ? { details: data.details } : {}) },
  }))
}
