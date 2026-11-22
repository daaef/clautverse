import { z } from 'zod'

export const pageQuery = { limit: z.coerce.number().int().min(1).max(100).default(20), cursor: z.string().max(500).optional() }

/** Decodes a signed cursor; `scope` stops a cursor from one list/sort being reused on another. */
export function readCursor<T extends Record<string, unknown>>(cursor: string | undefined, scope: string): T | null {
  if (!cursor) return null
  const data = decodeCursor<T & { s: string }>(cursor, useRuntimeConfig().cursorSecret)
  if (!data || data.s !== scope) throw apiError('VALIDATION_FAILED', 'Invalid cursor.', { fields: { cursor: 'invalid' } })
  return data
}

/** Pass `limit + 1` rows; returns `{ items, nextCursor }`. */
export function toPage<R, I>(rows: R[], limit: number, scope: string, key: (r: R) => Record<string, unknown>, map: (r: R) => I) {
  const more = rows.length > limit
  const slice = more ? rows.slice(0, limit) : rows
  const last = slice.at(-1)
  return {
    items: slice.map(map),
    nextCursor: more && last ? encodeCursor({ ...key(last), s: scope }, useRuntimeConfig().cursorSecret) : null,
  }
}
