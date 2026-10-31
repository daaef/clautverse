import { and, eq, ne } from 'drizzle-orm'

// ADM-07a: link talent, grant role, ensure community, auto-reject competing claims.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { internalNote } = await readJsonBody(event, decisionBody)
  const t = schema.identityClaim
  return useDb().transaction(async (tx) => {
    const [claim] = await tx.select().from(t).where(eq(t.id, id)).for('update').limit(1)
    if (!claim) throw apiError('NOT_FOUND', 'Claim not found.')
    if (claim.status === 'verified') return adminClaimView(claim)
    if (claim.status === 'rejected') throw apiError('INVALID_STATE', 'This claim was already rejected.')
    const [tal] = await tx.select().from(schema.talent).where(eq(schema.talent.id, claim.talentId)).for('update').limit(1)
    if (tal!.userId) throw apiError('INVALID_STATE', 'This profile has already been claimed.')
    const [other] = await tx.select({ id: schema.talent.id }).from(schema.talent).where(eq(schema.talent.userId, claim.userId)).limit(1)
    if (other) throw apiError('INVALID_STATE', 'This user already owns a talent profile.')
    const [linked] = await tx.update(schema.talent).set({ userId: claim.userId }).where(eq(schema.talent.id, tal!.id)).returning()
    const comm = await ensureTalentCommunity(tx, linked!)
    await grantRole(tx, claim.userId, 'talent')
    const now = new Date()
    const [row] = await tx.update(t).set({ status: 'verified', decidedAt: now, decidedBy: admin.id, internalNote: internalNote ?? null }).where(eq(t.id, id)).returning()
    await audit(tx, admin.id, 'claim.verified', 'identity_claim', id, { talentId: tal!.id, communityId: comm.id })
    await notify(tx, claim.userId, 'identity_claim.verified', { claimId: id, talentId: tal!.id, communityId: comm.id })
    const losers = await tx.update(t).set({ status: 'rejected', decidedAt: now, decidedBy: admin.id, decisionReason: 'Another claim on this profile was verified.' })
      .where(and(eq(t.talentId, tal!.id), eq(t.status, 'pending'), ne(t.id, id))).returning()
    for (const l of losers) {
      await audit(tx, admin.id, 'claim.auto_rejected', 'identity_claim', l.id, { verifiedClaimId: id })
      await notify(tx, l.userId, 'identity_claim.rejected', { claimId: l.id, talentId: tal!.id })
    }
    return adminClaimView(row!)
  })
})
