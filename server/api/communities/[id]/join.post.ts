import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// COM-03. The community row lock serialises joins, so at most 100 Originals positions are ever
// handed out; positions are permanent and never reassigned (decision 6).
const body = z.object({ alertsEnabled: z.boolean().optional() }).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event, { onboarded: true })
  const id = readIdParam(event)
  await rateLimit(event, 'community-join', u.id, 60, 3600)
  const { alertsEnabled } = await readJsonBody(event, body)
  const m = schema.membership
  const c = schema.community
  const result = await useDb().transaction(async (tx) => {
    const comm = await loadVisibleCommunity(id, null, tx, true)
    const [existing] = await tx.select().from(m).where(and(eq(m.userId, u.id), eq(m.communityId, id))).for('update').limit(1)
    if (existing?.status === 'active') return { created: false, row: existing }
    if (existing?.status === 'removed') throw apiError('FORBIDDEN', 'You were removed from this community.', { reason: 'removed' })
    if (existing) {
      const [row] = await tx.update(m).set({ status: 'active', leftAt: null, ...(alertsEnabled === undefined ? {} : { alertsEnabled }) })
        .where(eq(m.id, existing.id)).returning()
      await tx.update(c).set({ memberCount: sql`${c.memberCount} + 1` }).where(eq(c.id, id))
      return { created: false, row: row! }
    }
    const position = comm.originalsAssigned < ORIGINALS_CAP ? comm.originalsAssigned + 1 : null
    await tx.update(c).set({ memberCount: sql`${c.memberCount} + 1`, ...(position ? { originalsAssigned: position } : {}) }).where(eq(c.id, id))
    const [row] = await tx.insert(m).values({ userId: u.id, communityId: id, alertsEnabled: alertsEnabled ?? true, originalPosition: position }).returning()
    return { created: true, row: row! }
  })
  setResponseStatus(event, result.created ? 201 : 200)
  return membershipView(result.row)
})
