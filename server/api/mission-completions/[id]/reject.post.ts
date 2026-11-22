import { eq } from 'drizzle-orm'
import { z } from 'zod'

// MIS-10: reason required; no XP; the fan cannot resubmit. Reject after approve → INVALID_STATE.
const body = z.object({ reason: z.string().trim().min(1).max(500) }).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { reason } = await readJsonBody(event, body)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadCompletionForReview(tx, id, u)
    const c = r.completion
    if (c.status === 'rejected') return c
    if (c.status === 'approved') throw apiError('INVALID_STATE', 'Approved completions cannot be rejected; use an XP correction.', { currentStatus: c.status })
    const [done] = await tx.update(schema.missionCompletion).set({ status: 'rejected', rejectionReason: reason, reviewedBy: u.id, reviewedAt: new Date() })
      .where(eq(schema.missionCompletion.id, id)).returning()
    await notify(tx, c.userId, 'mission.completion_rejected', { missionId: c.missionId, completionId: id, reason })
    if (r.talent?.userId !== u.id) await audit(tx, u.id, 'completion.rejected', 'mission_completion', id, { reason })
    return done!
  })
  return completionView(row)
})
