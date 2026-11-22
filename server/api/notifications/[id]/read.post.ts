import { and, eq, sql } from 'drizzle-orm'

// NOT-03: idempotent; someone else's → 404.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const n = schema.notification
  const [row] = await useDb().update(n).set({ readAt: sql`coalesce(${n.readAt}, now())` })
    .where(and(eq(n.id, readIdParam(event)), eq(n.userId, u.id))).returning()
  if (!row) throw apiError('NOT_FOUND', 'Notification not found.')
  return notificationView(row)
})
