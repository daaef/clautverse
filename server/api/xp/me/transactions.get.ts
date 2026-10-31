import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// XP-02: every balance change is a ledger row.
const query = z.object({ sourceType: z.enum(['mission_completion', 'admin_adjustment']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { sourceType, limit, cursor } = readQuery(event, query)
  const scope = `xp-${sourceType ?? 'all'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const x = schema.xpTransaction
  const rows = await useDb().select().from(x).where(and(eq(x.userId, u.id), sourceType ? eq(x.sourceType, sourceType) : undefined,
    cur ? sql`(${x.createdAt}, ${x.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(desc(x.createdAt), desc(x.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.createdAt.toISOString(), id: r.id }), xpView)
})
