import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// MIS-06: one completion per fan. Auto-review grants XP in the same transaction.
const body = z.object({
  proof: z.object({ link: z.url({ protocol: /^https$/ }).max(500).optional(), text: z.string().trim().min(1).max(500).optional() }).strict().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event, { onboarded: true })
  const id = readIdParam(event)
  const { proof } = await readJsonBody(event, body)
  const mc = schema.missionCompletion
  const result = await useDb().transaction(async (tx) => {
    const r = await loadMission(id, u, tx)
    const status = missionStatus(r.mission)
    if (status !== 'approved') throw apiError('INVALID_STATE', 'This mission is not open for completions.', { currentStatus: status })
    const [m] = await tx.select().from(schema.membership).where(and(eq(schema.membership.userId, u.id), eq(schema.membership.communityId, r.mission.communityId))).limit(1)
    if (m?.status !== 'active') throw apiError('FORBIDDEN', 'Join this community to complete its missions.', { reason: 'not_member' })
    const [existing] = await tx.select().from(mc).where(and(eq(mc.missionId, id), eq(mc.userId, u.id))).limit(1)
    if (existing) return { row: existing, created: false }
    const need = r.mission.proof
    if (need === 'link' && !proof?.link) throw apiError('VALIDATION_FAILED', 'Add an https link as proof.', { fields: { 'proof.link': 'required' } })
    if (need === 'text' && !proof?.text) throw apiError('VALIDATION_FAILED', 'Add a short text as proof.', { fields: { 'proof.text': 'required' } })
    const auto = r.mission.review === 'auto'
    const [row] = await tx.insert(mc).values({
      missionId: id, userId: u.id, status: auto ? 'approved' : 'submitted',
      proofLink: need === 'link' ? proof!.link : null, proofText: need === 'text' ? proof!.text : null, reviewedAt: auto ? new Date() : null,
    }).onConflictDoNothing().returning()
    if (!row) return { row: (await tx.select().from(mc).where(and(eq(mc.missionId, id), eq(mc.userId, u.id))).limit(1))[0]!, created: false }
    if (!auto) return { row, created: true }
    const xp = await grantXp(tx, { userId: u.id, amount: r.mission.xpReward, sourceType: 'mission_completion', sourceId: row.id })
    const [done] = await tx.update(mc).set({ xpTransactionId: xp.id }).where(eq(mc.id, row.id)).returning()
    return { row: done!, created: true }
  })
  setResponseStatus(event, result.created ? 201 : 200)
  return completionView(result.row)
})
