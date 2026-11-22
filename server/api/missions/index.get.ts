import { and, asc, desc, eq, gt, isNull, lte, or, sql } from 'drizzle-orm'
import { z } from 'zod'

// MIS-01: active = approved & not expired (deadline asc nulls last); others createdAt desc.
const query = z.object({ communityId: z.uuid().optional(), status: z.enum(['active', 'expired', 'pending', 'rejected']).default('active'), ...pageQuery })

export default defineEventHandler(async (event) => {
  const viewer = await optionalUser(event)
  const { communityId, status, limit, cursor } = readQuery(event, query)
  let staff = isAdmin(viewer)
  if (communityId) {
    const comm = await loadVisibleCommunity(communityId, viewer)
    staff ||= !!viewer && await isCommunityOwner(comm, viewer.id)
  }
  const scope = `missions-${communityId ?? 'all'}-${status}`
  const ms = schema.mission
  const visible = and(communityId ? eq(ms.communityId, communityId) : undefined, isAdmin(viewer) ? undefined : eq(schema.community.status, 'active'))
  let where
  let order
  let key: (m: typeof ms.$inferSelect) => Record<string, unknown>
  if (status === 'active') {
    const cur = readCursor<{ d: string | null, id: string }>(cursor, scope)
    const after = !cur ? undefined
      : cur.d === null ? and(isNull(ms.deadline), sql`${ms.id} > ${cur.id}::uuid`)
        : or(sql`(${ms.deadline}, ${ms.id}) > (${cur.d}::timestamptz, ${cur.id}::uuid)`, isNull(ms.deadline))
    where = and(eq(ms.status, 'approved'), or(isNull(ms.deadline), gt(ms.deadline, sql`now()`)), after)
    order = [sql`${ms.deadline} asc nulls last`, asc(ms.id)]
    key = m => ({ d: m.deadline?.toISOString() ?? null, id: m.id })
  }
  else {
    const cur = readCursor<{ t: string, id: string }>(cursor, scope)
    const byStatus = status === 'expired'
      ? and(eq(ms.status, 'approved'), lte(ms.deadline, sql`now()`))
      : and(eq(ms.status, status), staff ? undefined : viewer ? eq(ms.creatorId, viewer.id) : sql`false`)
    where = and(byStatus, cur ? sql`(${ms.createdAt}, ${ms.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined)
    order = [desc(ms.createdAt), desc(ms.id)]
    key = m => ({ t: m.createdAt.toISOString(), id: m.id })
  }
  const rows = await useDb().select({ mission: ms, creator: schema.user }).from(ms)
    .innerJoin(schema.community, eq(schema.community.id, ms.communityId))
    .leftJoin(schema.user, eq(schema.user.id, ms.creatorId))
    .where(and(visible, where)).orderBy(...order).limit(limit + 1)
  const mine = await viewerCompletions(viewer?.id, rows.map(r => r.mission.id))
  return toPage(rows, limit, scope, r => key(r.mission), r => missionView(r.mission, r.creator, mine.get(r.mission.id) ?? null))
})
