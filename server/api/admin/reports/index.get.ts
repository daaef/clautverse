import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-12: FIFO queue.
const query = z.object({
  status: z.enum(['open', 'actioned', 'dismissed']).default('open'),
  targetType: z.enum(['drop', 'reply', 'user', 'community', 'mission']).optional(),
  ...pageQuery,
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status, targetType, limit, cursor } = readQuery(event, query)
  const scope = `admin-reports-${status}-${targetType ?? ''}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const r = schema.report
  const rows = await useDb().select().from(r).where(and(eq(r.status, status), targetType ? eq(r.targetType, targetType) : undefined,
    cur ? sql`(${r.createdAt}, ${r.id}) > (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(asc(r.createdAt), asc(r.id)).limit(limit + 1)
  return toPage(rows, limit, scope, x => ({ t: x.createdAt.toISOString(), id: x.id }), adminReportView)
})
