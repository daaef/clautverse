import { eq } from 'drizzle-orm'

// MIS-09: grants XP once (ledger key) and notifies the fan. Repeat → 200 unchanged.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadCompletionForReview(tx, id, u)
    const c = r.completion
    if (c.status === 'approved') return c
    if (c.status === 'rejected') throw apiError('INVALID_STATE', 'This completion was rejected.', { currentStatus: c.status })
    const xp = await grantXp(tx, { userId: c.userId, amount: r.mission.xpReward, sourceType: 'mission_completion', sourceId: c.id, actorId: u.id })
    const [done] = await tx.update(schema.missionCompletion).set({ status: 'approved', xpTransactionId: xp.id, reviewedBy: u.id, reviewedAt: new Date() })
      .where(eq(schema.missionCompletion.id, id)).returning()
    await notify(tx, c.userId, 'mission.completion_approved', { missionId: c.missionId, completionId: id, xp: r.mission.xpReward })
    if (r.talent?.userId !== u.id) await audit(tx, u.id, 'completion.approved', 'mission_completion', id)
    return done!
  })
  return completionView(row)
})
