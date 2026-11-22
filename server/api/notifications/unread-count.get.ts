import { and, eq, isNull, sql } from 'drizzle-orm'

// NOT-02: polled by the bell.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const n = schema.notification
  const [r] = await useDb().select({ count: sql<number>`count(*)::int` }).from(n).where(and(eq(n.userId, u.id), isNull(n.readAt)))
  return { count: r!.count }
})
