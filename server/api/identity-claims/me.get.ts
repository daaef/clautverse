import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// TAL-05
const query = z.object(pageQuery)

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { limit, cursor } = readQuery(event, query)
  const c = readCursor<{ t: string, id: string }>(cursor, 'claims-me')
  const t = schema.identityClaim
  const rows = await useDb().select().from(t)
    .where(and(eq(t.userId, u.id), c ? sql`(${t.submittedAt}, ${t.id}) < (${c.t}::timestamptz, ${c.id}::uuid)` : undefined))
    .orderBy(desc(t.submittedAt), desc(t.id)).limit(limit + 1)
  return toPage(rows, limit, 'claims-me', r => ({ t: r.submittedAt.toISOString(), id: r.id }), claimView)
})
