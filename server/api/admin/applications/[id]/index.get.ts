import { eq } from 'drizzle-orm'

// ADM-03. Evidence files arrive with uploads (R2); until then there is no evidence to sign or audit.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = readIdParam(event)
  const t = schema.talentApplication
  const [r] = await useDb().select({ app: t, applicant: schema.user }).from(t).innerJoin(schema.user, eq(schema.user.id, t.userId)).where(eq(t.id, id)).limit(1)
  if (!r) throw apiError('NOT_FOUND', 'Application not found.')
  return { ...adminApplicationView(r.app), applicant: { ...publicUser(r.applicant), email: r.applicant.email }, evidence: [] }
})
