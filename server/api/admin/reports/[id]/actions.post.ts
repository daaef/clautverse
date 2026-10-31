import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-13: apply the action and close the report in one transaction; everything audited.
const body = z.object({
  action: z.enum(['dismiss', 'remove_content', 'suspend_user', 'remove_member', 'veto_community']),
  internalNote: z.string().trim().max(2000).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { action, internalNote } = await readJsonBody(event, body)
  const row = await useDb().transaction(async (tx) => {
    const [r] = await tx.select().from(schema.report).where(eq(schema.report.id, id)).for('update').limit(1)
    if (!r) throw apiError('NOT_FOUND', 'Report not found.')
    if (r.status !== 'open') throw apiError('INVALID_STATE', 'This report is already closed.')
    const subject = action === 'dismiss' ? null : await reportSubject(tx, r)
    const unsupported = () => apiError('VALIDATION_FAILED', `"${action}" does not apply to a ${r.targetType} report.`, { fields: { action: 'not_applicable' } })
    if (action !== 'dismiss' && !subject) throw apiError('NOT_FOUND', 'The reported item no longer exists.')
    if (action === 'remove_content') {
      if (subject?.drop) await tx.update(schema.drop).set({ status: 'removed' }).where(eq(schema.drop.id, subject.drop.id))
      else if (subject?.reply) {
        if (subject.reply.status === 'active')
          await tx.update(schema.drop).set({ replyCount: sql`greatest(${schema.drop.replyCount} - 1, 0)` }).where(eq(schema.drop.id, subject.reply.dropId))
        await tx.update(schema.reply).set({ status: 'removed' }).where(eq(schema.reply.id, subject.reply.id))
      }
      else throw unsupported()
      await audit(tx, admin.id, `${r.targetType}.removed`, r.targetType, r.targetId, { reportId: r.id })
    }
    else if (action === 'suspend_user') {
      if (!subject?.userId) throw unsupported()
      await suspendUser(tx, admin, subject.userId, { reason: `Report ${r.id} (${r.reason})`, internalNote })
    }
    else if (action === 'remove_member') {
      if (!subject?.userId || !subject.communityId) throw unsupported()
      await removeMember(tx, admin.id, subject.userId, subject.communityId)
    }
    else if (action === 'veto_community') {
      if (!subject?.communityId) throw unsupported()
      await tx.update(schema.community).set({ status: 'vetoed' }).where(eq(schema.community.id, subject.communityId))
      await audit(tx, admin.id, 'community.vetoed', 'community', subject.communityId, { reportId: r.id })
    }
    const [closed] = await tx.update(schema.report).set({
      status: action === 'dismiss' ? 'dismissed' : 'actioned', action, internalNote: internalNote ?? null, decidedBy: admin.id, decidedAt: new Date(),
    }).where(eq(schema.report.id, id)).returning()
    await audit(tx, admin.id, action === 'dismiss' ? 'report.dismissed' : 'report.actioned', 'report', id, { action })
    return closed!
  })
  return adminReportView(row)
})
