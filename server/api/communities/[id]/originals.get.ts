import { and, asc, eq, gt, isNotNull } from 'drizzle-orm'
import { z } from 'zod'

// COM-08: public Originals wall. Removed or deleted users appear as retired slots.
const query = z.object(pageQuery)

export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const { limit, cursor } = readQuery(event, query)
  await loadVisibleCommunity(id, await optionalUser(event))
  const scope = `com-originals-${id}`
  const cur = readCursor<{ p: number }>(cursor, scope)
  const m = schema.membership
  const rows = await useDb().select({ m, user: schema.user }).from(m).innerJoin(schema.user, eq(schema.user.id, m.userId)).where(and(
    eq(m.communityId, id), isNotNull(m.originalPosition), cur ? gt(m.originalPosition, cur.p) : undefined,
  )).orderBy(asc(m.originalPosition)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ p: r.m.originalPosition }), (r) => {
    const retired = r.m.status === 'removed' || r.user.status !== 'active'
    return { position: r.m.originalPosition!, user: retired ? null : publicUser(r.user), retired, assignedAt: r.m.joinedAt.toISOString() }
  })
})
