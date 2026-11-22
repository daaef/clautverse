import { desc, eq, sql, and } from 'drizzle-orm'
import { z } from 'zod'

// ADM-08a: includes vetoed communities.
const query = z.object({ status: z.enum(['active', 'vetoed']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status, limit, cursor } = readQuery(event, query)
  const scope = `adm-com-${status ?? 'all'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const c = schema.community
  const rows = await useDb().select().from(c).where(and(
    status ? eq(c.status, status) : undefined,
    cur ? sql`(${c.createdAt}, ${c.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined,
  )).orderBy(desc(c.createdAt), desc(c.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.createdAt.toISOString(), id: r.id }), r => communityCard(r, null))
})
