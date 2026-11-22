import { eq } from 'drizzle-orm'

// ADM-07b
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { internalNote, decisionReason } = await readJsonBody(event, decisionBody)
  const t = schema.identityClaim
  return useDb().transaction(async (tx) => {
    const [claim] = await tx.select().from(t).where(eq(t.id, id)).for('update').limit(1)
    if (!claim) throw apiError('NOT_FOUND', 'Claim not found.')
    if (claim.status === 'rejected') return adminClaimView(claim)
    if (claim.status === 'verified') throw apiError('INVALID_STATE', 'This claim was already verified.')
    if (!decisionReason) throw apiError('VALIDATION_FAILED', 'Give the claimant a reason.', { fields: { decisionReason: 'required' } })
    const [row] = await tx.update(t).set({ status: 'rejected', decidedAt: new Date(), decidedBy: admin.id, decisionReason, internalNote: internalNote ?? null }).where(eq(t.id, id)).returning()
    await audit(tx, admin.id, 'claim.rejected', 'identity_claim', id)
    await notify(tx, claim.userId, 'identity_claim.rejected', { claimId: id, talentId: claim.talentId })
    return adminClaimView(row!)
  })
})
