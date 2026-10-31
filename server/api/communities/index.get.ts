import { and, asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

// COM-01. "popular" = most members (decision 20.7). Cursors are scoped to their sort.
const query = z.object({
  q: z.string().trim().max(60).optional(),
  talentId: z.uuid().optional(),
  showId: z.uuid().optional(),
  sort: z.enum(['popular', 'newest', 'name']).default('popular'),
  ...pageQuery,
})

export default defineEventHandler(async (event) => {
  const { q, talentId, showId, sort, limit, cursor } = readQuery(event, query)
  const viewer = await optionalUser(event)
  const scope = `com-${sort}`
  const cur = readCursor<{ v: string | number, id: string }>(cursor, scope)
  const c = schema.community
  const db = useDb()
  let talentIds: string[] | undefined
  if (showId) {
    talentIds = (await db.selectDistinct({ id: schema.seasonTalent.talentId }).from(schema.seasonTalent)
      .innerJoin(schema.season, eq(schema.season.id, schema.seasonTalent.seasonId)).where(eq(schema.season.showId, showId))).map(r => r.id)
    if (!talentIds.length) return { items: [], nextCursor: null }
  }
  const keyset = !cur ? undefined
    : sort === 'popular' ? sql`(${c.memberCount}, ${c.id}) < (${Number(cur.v)}, ${cur.id}::uuid)`
      : sort === 'newest' ? sql`(${c.createdAt}, ${c.id}) < (${String(cur.v)}::timestamptz, ${cur.id}::uuid)`
        : sql`(${c.name}, ${c.id}) > (${String(cur.v)}, ${cur.id}::uuid)`
  const order = sort === 'popular' ? [desc(c.memberCount), desc(c.id)] : sort === 'newest' ? [desc(c.createdAt), desc(c.id)] : [asc(c.name), asc(c.id)]
  const rows = await db.select().from(c).where(and(
    eq(c.status, 'active'),
    q ? ilike(c.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`) : undefined,
    talentId ? eq(c.ownerTalentId, talentId) : undefined,
    talentIds ? inArray(c.ownerTalentId, talentIds) : undefined,
    keyset,
  )).orderBy(...order).limit(limit + 1)
  const mine = await viewerMemberships(viewer?.id, rows.map(r => r.id))
  return toPage(rows, limit, scope,
    r => ({ v: sort === 'popular' ? r.memberCount : sort === 'newest' ? r.createdAt.toISOString() : r.name, id: r.id }),
    r => communityCard(r, mine.get(r.id)))
})
