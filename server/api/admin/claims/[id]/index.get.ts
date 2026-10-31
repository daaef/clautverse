import { eq } from 'drizzle-orm'

// ADM-07: viewing evidence is audited.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const t = schema.identityClaim
  const db = useDb()
  const [r] = await db.select({ claim: t, claimant: schema.user, talent: schema.talent }).from(t)
    .innerJoin(schema.user, eq(schema.user.id, t.userId)).innerJoin(schema.talent, eq(schema.talent.id, t.talentId)).where(eq(t.id, id)).limit(1)
  if (!r) throw apiError('NOT_FOUND', 'Claim not found.')
  await audit(db, admin.id, 'claim.evidence_viewed', 'identity_claim', id)
  return { ...adminClaimView(r.claim), talent: { id: r.talent.id, name: r.talent.name, slug: r.talent.slug }, claimant: { ...publicUser(r.claimant), email: r.claimant.email } }
})
