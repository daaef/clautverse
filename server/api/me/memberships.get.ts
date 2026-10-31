import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// COM-05
const query = z.object({ status: z.enum(['active', 'left']).default('active'), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { status, limit, cursor } = readQuery(event, query)
  const scope = `me-memberships-${status}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const m = schema.membership
  const rows = await useDb().select({ m, c: schema.community }).from(m).innerJoin(schema.community, eq(schema.community.id, m.communityId)).where(and(
    eq(m.userId, u.id), eq(m.status, status), eq(schema.community.status, 'active'),
    cur ? sql`(${m.joinedAt}, ${m.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined,
  )).orderBy(desc(m.joinedAt), desc(m.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.m.joinedAt.toISOString(), id: r.m.id }),
    r => ({ ...membershipView(r.m), community: communityCard(r.c, r.m) }))
})
