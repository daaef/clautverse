import type { H3Event } from 'h3'
import { sql } from 'drizzle-orm'

/**
 * Fixed-window rate limit stored in Postgres (no Redis needed).
 * Throws RATE_LIMITED with Retry-After when `limit` is exceeded within `windowSeconds`.
 */
export async function rateLimit(event: H3Event, name: string, subject: string, limit: number, windowSeconds: number) {
  const key = `${name}:${subject}`
  const rows = await useDb().execute<{ count: number, window_start: Date }>(sql`
    insert into api_rate_limit (key, window_start, count) values (${key}, now(), 1)
    on conflict (key) do update set
      count = case when api_rate_limit.window_start < now() - make_interval(secs => ${windowSeconds}) then 1 else api_rate_limit.count + 1 end,
      window_start = case when api_rate_limit.window_start < now() - make_interval(secs => ${windowSeconds}) then now() else api_rate_limit.window_start end
    returning count, window_start`)
  const row = rows[0]!
  if (row.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((new Date(row.window_start).getTime() + windowSeconds * 1000 - Date.now()) / 1000))
    setResponseHeader(event, 'Retry-After', retryAfter)
    throw apiError('RATE_LIMITED', 'Too many requests. Try again later.', { retryAfterSeconds: retryAfter })
  }
}

export function clientIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}
