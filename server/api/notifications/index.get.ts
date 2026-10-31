import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

// NOT-01: own notifications only, newest first.
const query = z.object({ unreadOnly: z.enum(['true', 'false']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { unreadOnly, limit, cursor } = readQuery(event, query)
  const scope = `notifications-${unreadOnly ?? 'false'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const n = schema.notification
  const rows = await useDb().select().from(n).where(and(eq(n.userId, u.id), unreadOnly === 'true' ? isNull(n.readAt) : undefined,
    cur ? sql`(${n.createdAt}, ${n.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(desc(n.createdAt), desc(n.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.createdAt.toISOString(), id: r.id }), notificationView)
})
