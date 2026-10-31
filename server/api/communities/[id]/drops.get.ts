import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// FEED-02: public community timeline; non-entitled viewers get locked cards.
const query = z.object({ type: z.enum(['text', 'voice', 'image']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const { type, limit, cursor } = readQuery(event, query)
  const viewer = await optionalUser(event)
  const comm = await loadVisibleCommunity(id, viewer)
  const scope = `com-drops-${id}-${type ?? 'all'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const d = schema.drop
  const rows = await useDb().select({ drop: d, talent: schema.talent }).from(d)
    .leftJoin(schema.talent, eq(schema.talent.id, sql`${comm.ownerTalentId}::uuid`))
    .where(and(eq(d.communityId, id), liveFilter(), type ? eq(d.type, type) : undefined,
      cur ? sql`(${d.publishAt}, ${d.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(desc(d.publishAt), desc(d.id)).limit(limit + 1)
  const view = await dropListViews(rows, viewer)
  return toPage(rows, limit, scope, r => ({ t: r.drop.publishAt!.toISOString(), id: r.drop.id }), view)
})
