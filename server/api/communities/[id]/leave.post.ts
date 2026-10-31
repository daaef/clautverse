import { and, eq, sql } from 'drizzle-orm'

// COM-04. Originals position is kept for a later rejoin.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const m = schema.membership
  const c = schema.community
  const row = await useDb().transaction(async (tx) => {
    const comm = await loadVisibleCommunity(id, null, tx, true)
    const [existing] = await tx.select().from(m).where(and(eq(m.userId, u.id), eq(m.communityId, id))).for('update').limit(1)
    if (!existing) throw apiError('NOT_FOUND', 'You are not a member of this community.')
    if (existing.status !== 'active') return existing
    if (await isCommunityOwner(comm, u.id, tx)) throw apiError('INVALID_STATE', 'You cannot leave your own community.')
    const [updated] = await tx.update(m).set({ status: 'left', leftAt: new Date() }).where(eq(m.id, existing.id)).returning()
    await tx.update(c).set({ memberCount: sql`greatest(${c.memberCount} - 1, 0)` }).where(eq(c.id, id))
    return updated!
  })
  return membershipView(row)
})
