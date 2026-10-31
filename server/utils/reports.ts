import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

type Report = typeof schema.report.$inferSelect

const uuid = z.uuid()
export const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string, cause?: { code?: string } }
  return err?.code === '23505' || err?.cause?.code === '23505'
}

/** The reporter must be able to see what they report; missions arrive later. */
export async function assertReportTarget(type: Report['targetType'], id: string, viewer: DbUser) {
  const notFound = () => apiError('NOT_FOUND', 'Nothing to report here.')
  if (type !== 'user' && !uuid.safeParse(id).success) throw notFound()
  if (type === 'drop') await loadDrop(id, viewer)
  else if (type === 'community') await loadVisibleCommunity(id, viewer)
  else if (type === 'reply') {
    const [r] = await useDb().select().from(schema.reply).where(eq(schema.reply.id, id)).limit(1)
    if (!r || r.status !== 'active') throw notFound()
    await loadDrop(r.dropId, viewer)
  }
  else if (type === 'user') {
    const [t] = await useDb().select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.id, id)).limit(1)
    if (!t) throw notFound()
  }
  else throw notFound()
}

export const adminReportView = (r: Report) => ({
  id: r.id, target: { type: r.targetType, id: r.targetId }, reason: r.reason, details: r.details, reporterId: r.reporterId,
  status: r.status, action: r.action, internalNote: r.internalNote, decidedBy: r.decidedBy,
  createdAt: r.createdAt.toISOString(), decidedAt: r.decidedAt?.toISOString() ?? null,
})

/** Resolves the author and community behind a drop/reply/community/user target. */
export async function reportSubject(tx: DbOrTx, r: Report) {
  if (r.targetType === 'drop') {
    const [d] = await tx.select().from(schema.drop).where(eq(schema.drop.id, r.targetId)).limit(1)
    return d ? { userId: d.authorId, communityId: d.communityId, drop: d } : null
  }
  if (r.targetType === 'reply') {
    const [x] = await tx.select({ reply: schema.reply, communityId: schema.drop.communityId }).from(schema.reply)
      .innerJoin(schema.drop, eq(schema.drop.id, schema.reply.dropId)).where(eq(schema.reply.id, r.targetId)).limit(1)
    return x ? { userId: x.reply.authorId, communityId: x.communityId, reply: x.reply } : null
  }
  if (r.targetType === 'community') return { userId: null, communityId: r.targetId }
  if (r.targetType === 'user') return { userId: r.targetId, communityId: null }
  return null
}

/** Removal retires the Originals position: the row keeps it, and the counter never hands it out again. */
export async function removeMember(tx: DbOrTx, actorId: string, userId: string, communityId: string) {
  const m = schema.membership
  const [row] = await tx.select().from(m).where(sql`${m.userId} = ${userId} and ${m.communityId} = ${communityId}`).for('update').limit(1)
  if (!row) throw apiError('VALIDATION_FAILED', 'That user is not a member of this community.', { fields: { action: 'not_member' } })
  if (row.status === 'removed') return
  await tx.update(m).set({ status: 'removed', leftAt: new Date() }).where(eq(m.id, row.id))
  if (row.status === 'active') await tx.update(schema.community).set({ memberCount: sql`greatest(${schema.community.memberCount} - 1, 0)` }).where(eq(schema.community.id, communityId))
  await audit(tx, actorId, 'membership.removed', 'membership', row.id, { userId, communityId, originalPosition: row.originalPosition })
}
