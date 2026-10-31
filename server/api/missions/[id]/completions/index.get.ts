import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// MIS-08: owner/admin review queue, oldest first.
const query = z.object({ status: z.enum(['submitted', 'approved', 'rejected']).optional(), ...pageQuery })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const r = await loadMission(readIdParam(event), u)
  if (!r.isStaff) throw apiError('FORBIDDEN', 'Only the community\'s talent can review completions.')
  const { status, limit, cursor } = readQuery(event, query)
  const scope = `completions-${r.mission.id}-${status ?? ''}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const mc = schema.missionCompletion
  const rows = await useDb().select({ c: mc, user: schema.user }).from(mc).leftJoin(schema.user, eq(schema.user.id, mc.userId))
    .where(and(eq(mc.missionId, r.mission.id), status ? eq(mc.status, status) : undefined,
      cur ? sql`(${mc.createdAt}, ${mc.id}) > (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(asc(mc.createdAt), asc(mc.id)).limit(limit + 1)
  return toPage(rows, limit, scope, x => ({ t: x.c.createdAt.toISOString(), id: x.c.id }),
    x => ({ ...completionView(x.c), user: x.user ? publicUser(x.user) : null }))
})
