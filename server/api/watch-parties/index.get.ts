import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

// WP-01: upcoming (scheduled|live) soonest first; past (ended|cancelled) newest first.
const query = z.object({ status: z.enum(['upcoming', 'past']).default('upcoming'), communityId: z.uuid().optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const viewer = await optionalUser(event)
  const { status, communityId, limit, cursor } = readQuery(event, query)
  if (communityId) await loadVisibleCommunity(communityId, viewer)
  const scope = `parties-${status}-${communityId ?? 'all'}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const w = schema.watchParty
  const up = status === 'upcoming'
  const after = cur ? (up ? sql`(${w.startsAt}, ${w.id}) > (${cur.t}::timestamptz, ${cur.id}::uuid)` : sql`(${w.startsAt}, ${w.id}) < (${cur.t}::timestamptz, ${cur.id}::uuid)`) : undefined
  const rows = await useDb().select({ party: w, host: schema.user }).from(w)
    .innerJoin(schema.community, eq(schema.community.id, w.communityId))
    .leftJoin(schema.user, eq(schema.user.id, w.hostId))
    .where(and(eq(schema.community.status, 'active'), communityId ? eq(w.communityId, communityId) : undefined,
      inArray(w.status, up ? ['scheduled', 'live'] : ['ended', 'cancelled']), after))
    .orderBy(...(up ? [asc(w.startsAt), asc(w.id)] : [desc(w.startsAt), desc(w.id)])).limit(limit + 1)
  const going = await viewerRsvps(viewer?.id, rows.map(r => r.party.id))
  return toPage(rows, limit, scope, r => ({ t: r.party.startsAt.toISOString(), id: r.party.id }), r => partyView(r.party, r.host, going.has(r.party.id)))
})
