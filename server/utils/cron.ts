import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/** Internal job routes answer 404 unless called with `Authorization: Bearer <cronSecret>`. */
export function requireCron(event: H3Event) {
  const secret = useRuntimeConfig(event).cronSecret
  const got = getHeader(event, 'authorization') ?? ''
  const want = `Bearer ${secret}`
  if (!secret || got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) throw apiError('NOT_FOUND', 'Not found.')
}
