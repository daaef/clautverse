import { and, asc, eq, isNotNull, sql } from 'drizzle-orm'
import { z } from 'zod'

// COM-07: active members, the owner and admins only. Never exposes email or date of birth.
const query = z.object({ originalsOnly: z.enum(['true', 'false']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { originalsOnly, limit, cursor } = readQuery(event, query)
  const comm = await loadVisibleCommunity(id, u)
  const m = schema.membership
  const db = useDb()
  if (!isAdmin(u) && !(await isCommunityOwner(comm, u.id))) {
    const [mine] = await db.select({ status: m.status }).from(m).where(and(eq(m.userId, u.id), eq(m.communityId, id))).limit(1)
    if (mine?.status !== 'active') throw apiError('FORBIDDEN', 'Join this community to see its members.', { reason: 'not_member' })
  }
  const scope = `com-members-${id}-${originalsOnly ?? 'false'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const rows = await db.select({ m, user: schema.user }).from(m).innerJoin(schema.user, eq(schema.user.id, m.userId)).where(and(
    eq(m.communityId, id), eq(m.status, 'active'), eq(schema.user.status, 'active'),
    originalsOnly === 'true' ? isNotNull(m.originalPosition) : undefined,
    cur ? sql`(${m.joinedAt}, ${m.id}) > (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined,
  )).orderBy(asc(m.joinedAt), asc(m.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.m.joinedAt.toISOString(), id: r.m.id }),
    r => ({ user: publicUser(r.user), joinedAt: r.m.joinedAt.toISOString(), lane: r.m.lane, originalPosition: r.m.originalPosition }))
})
