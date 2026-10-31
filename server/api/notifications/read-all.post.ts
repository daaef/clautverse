import { and, eq, isNull } from 'drizzle-orm'

// NOT-04: only the caller's unread notifications.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const n = schema.notification
  const rows = await useDb().update(n).set({ readAt: new Date() }).where(and(eq(n.userId, u.id), isNull(n.readAt))).returning({ id: n.id })
  return { updated: rows.length }
})
