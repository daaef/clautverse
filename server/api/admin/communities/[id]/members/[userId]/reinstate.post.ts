import { and, eq, sql } from 'drizzle-orm'

// ADM-16: reinstate a removed member. Clears the active block (status + blockedUntil) but does
// NOT decrement removalCount (owner ruling, spec §9): a later removal still counts upward.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const communityId = readIdParam(event)
  const userId = getRouterParam(event, 'userId')
  if (!userId || userId.length > 100 || !/^[\w-]+$/.test(userId)) throw apiError('NOT_FOUND', 'Not found.')
  const input = await readJsonBody(event, adminActionBody)
  const m = schema.membership
  const row = await useDb().transaction(async (tx) => {
    const [existing] = await tx.select().from(m).where(and(eq(m.userId, userId), eq(m.communityId, communityId))).for('update').limit(1)
    if (!existing) throw apiError('NOT_FOUND', 'Membership not found.')
    if (existing.status !== 'removed') return existing
    const [updated] = await tx.update(m).set({ status: 'active', leftAt: null, blockedUntil: null }).where(eq(m.id, existing.id)).returning()
    await tx.update(schema.community).set({ memberCount: sql`${schema.community.memberCount} + 1` }).where(eq(schema.community.id, communityId))
    await audit(tx, admin.id, 'membership.reinstated', 'membership', existing.id, {
      userId, communityId, removalCount: existing.removalCount, reason: input.reason, internalNote: input.internalNote ?? null,
    })
    return updated!
  })
  return membershipView(row)
})
