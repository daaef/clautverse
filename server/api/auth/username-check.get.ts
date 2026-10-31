import { eq } from 'drizzle-orm'
import { z } from 'zod'

// AUTH-05
const query = z.object({ username: z.string().trim().toLowerCase() })

export default defineEventHandler(async (event) => {
  await rateLimit(event, 'username-check', clientIp(event), 30, 60)
  const { username } = readQuery(event, query)
  if (!USERNAME_RE.test(username)) return { username, available: false, reason: 'invalid' }
  if (RESERVED_USERNAMES.has(username)) return { username, available: false, reason: 'reserved' }
  const [row] = await useDb().select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, username)).limit(1)
  return row ? { username, available: false, reason: 'taken' } : { username, available: true }
})
