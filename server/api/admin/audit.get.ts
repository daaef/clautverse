import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-14: read-only. No route updates or deletes audit rows.
const query = z.object({
  actorId: z.string().max(100).optional(),
  targetType: z.string().max(50).optional(),
  targetId: z.string().max(100).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  ...pageQuery,
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { actorId, targetType, targetId, from, to, limit, cursor } = readQuery(event, query)
  const c = readCursor<{ t: string, id: string }>(cursor, 'adm-audit')
  const a = schema.adminAudit
  const rows = await useDb().select().from(a).where(and(
    actorId ? eq(a.actorId, actorId) : undefined,
    targetType ? eq(a.targetType, targetType) : undefined,
    targetId ? eq(a.targetId, targetId) : undefined,
    from ? gte(a.createdAt, new Date(from)) : undefined,
    to ? lte(a.createdAt, new Date(to)) : undefined,
    c ? sql`(${a.createdAt}, ${a.id}) < (${c.t}::timestamptz, ${c.id}::uuid)` : undefined,
  )).orderBy(desc(a.createdAt), desc(a.id)).limit(limit + 1)
  return toPage(rows, limit, 'adm-audit', r => ({ t: r.createdAt.toISOString(), id: r.id }), r => ({
    id: r.id, actorId: r.actorId, action: r.action, targetType: r.targetType, targetId: r.targetId, metadata: r.metadata, createdAt: r.createdAt.toISOString(),
  }))
})
