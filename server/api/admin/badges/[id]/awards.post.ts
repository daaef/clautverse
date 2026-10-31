import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// ADM-16b: idempotent per (badge, user); audited and notified once.
const body = z.object({ userId: z.string().min(1).max(100) }).strict()

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const badgeId = readIdParam(event)
  const { userId } = await readJsonBody(event, body)
  const res = await useDb().transaction(async (tx) => {
    const [b] = await tx.select().from(schema.badge).where(eq(schema.badge.id, badgeId)).limit(1)
    if (!b) throw apiError('NOT_FOUND', 'Badge not found.')
    const [target] = await tx.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.id, userId)).limit(1)
    if (!target) throw apiError('NOT_FOUND', 'User not found.')
    const [added] = await tx.insert(schema.badgeAward).values({ badgeId, userId, awardedBy: admin.id }).onConflictDoNothing().returning()
    if (added) {
      await audit(tx, admin.id, 'badge.awarded', 'user', userId, { badgeId })
      await notify(tx, userId, 'badge.awarded', { badgeId })
      return { row: added, created: true }
    }
    const [existing] = await tx.select().from(schema.badgeAward).where(and(eq(schema.badgeAward.badgeId, badgeId), eq(schema.badgeAward.userId, userId))).limit(1)
    return { row: existing!, created: false }
  })
  setResponseStatus(event, res.created ? 201 : 200)
  return { badgeId, userId, awardedAt: res.row.awardedAt.toISOString() }
})
