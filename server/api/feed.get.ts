import { and, desc, eq, inArray, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

// FEED-01: live drops from my active memberships. Keyset paging on (publish_at, id) so new
// drops arriving between page fetches never cause duplicates.
const query = z.object({ communityId: z.uuid().optional(), from: z.iso.datetime({ offset: true }).optional(), to: z.iso.datetime({ offset: true }).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { communityId, from, to, limit, cursor } = readQuery(event, query)
  if (from && to && (new Date(from) >= new Date(to) || new Date(to).getTime() - new Date(from).getTime() > 90 * 86400_000))
    throw apiError('VALIDATION_FAILED', 'from must be before to, within 90 days.', { fields: { from: 'invalid_range' } })
  const scope = `feed-${communityId ?? 'all'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const db = useDb()
  const m = schema.membership
  const memberOf = (await db.select({ id: m.communityId }).from(m).where(and(eq(m.userId, u.id), eq(m.status, 'active')))).map(r => r.id)
  if (communityId && !memberOf.includes(communityId)) throw apiError('FORBIDDEN', 'Join this community to see its feed.', { reason: 'not_member' })
  const ids = communityId ? [communityId] : memberOf
  if (!ids.length) return { items: [], nextCursor: null }
  const d = schema.drop
  const rows = await db.select({ drop: d, talent: schema.talent }).from(d)
    .innerJoin(schema.community, eq(schema.community.id, d.communityId))
    .leftJoin(schema.talent, eq(schema.talent.id, schema.community.ownerTalentId))
    .where(and(inArray(d.communityId, ids), eq(schema.community.status, 'active'), liveFilter(),
      from ? gte(d.publishAt, new Date(from)) : undefined, to ? lte(d.publishAt, new Date(to)) : undefined,
      cur ? sql`(${d.publishAt}, ${d.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(desc(d.publishAt), desc(d.id)).limit(limit + 1)
  const view = await dropListViews(rows, u)
  return toPage(rows, limit, scope, r => ({ t: r.drop.publishAt!.toISOString(), id: r.drop.id }), view)
})
