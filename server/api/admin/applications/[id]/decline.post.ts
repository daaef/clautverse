import { eq } from 'drizzle-orm'

// ADM-05
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { internalNote, decisionReason } = await readJsonBody(event, decisionBody)
  const t = schema.talentApplication
  return useDb().transaction(async (tx) => {
    const [app] = await tx.select().from(t).where(eq(t.id, id)).for('update').limit(1)
    if (!app) throw apiError('NOT_FOUND', 'Application not found.')
    if (app.status === 'declined') return adminApplicationView(app)
    if (app.status === 'accepted') throw apiError('INVALID_STATE', 'This application was already accepted.')
    if (!decisionReason) throw apiError('VALIDATION_FAILED', 'Give the applicant a reason.', { fields: { decisionReason: 'required' } })
    const [row] = await tx.update(t).set({ status: 'declined', decidedAt: new Date(), decidedBy: admin.id, decisionReason, internalNote: internalNote ?? null })
      .where(eq(t.id, id)).returning()
    await audit(tx, admin.id, 'application.declined', 'talent_application', id)
    await notify(tx, app.userId, 'talent_application.declined', { applicationId: id })
    return adminApplicationView(row!)
  })
})
