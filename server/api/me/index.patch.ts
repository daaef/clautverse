import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

// AUTH-07
const body = z.object({
  username: z.string().trim().toLowerCase().regex(USERNAME_RE, 'must be 3-30 characters: a-z, 0-9 or _').optional(),
  displayName: z.string().trim().min(1).max(50).nullable().optional(),
}).strict().refine(b => Object.keys(b).length > 0, 'provide at least one field')

const USERNAME_CHANGE_DAYS = 30

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const input = await readJsonBody(event, body)
  const db = useDb()
  const patch: Partial<typeof schema.user.$inferInsert> = { updatedAt: new Date() }

  if (input.username && input.username !== me.username) {
    if (RESERVED_USERNAMES.has(input.username)) throw apiError('VALIDATION_FAILED', 'Some fields are invalid.', { fields: { username: 'reserved' } })
    if (me.usernameChangedAt) {
      const next = new Date(me.usernameChangedAt.getTime() + USERNAME_CHANGE_DAYS * 86_400_000)
      if (next > new Date()) throw apiError('INVALID_STATE', 'You can change your username once every 30 days.', { nextChangeAt: next.toISOString() })
    }
    const [taken] = await db.select({ id: schema.user.id }).from(schema.user)
      .where(and(eq(schema.user.username, input.username), ne(schema.user.id, me.id))).limit(1)
    if (taken) throw apiError('CONFLICT', 'That username is taken.', { field: 'username' })
    patch.username = input.username
    patch.usernameChangedAt = new Date()
  }
  if (input.displayName !== undefined) patch.displayName = input.displayName

  try {
    const [updated] = await db.update(schema.user).set(patch).where(eq(schema.user.id, me.id)).returning()
    return toMe(updated!)
  }
  catch (e: any) {
    if (e?.code === '23505') throw apiError('CONFLICT', 'That username is taken.', { field: 'username' })
    throw e
  }
})
