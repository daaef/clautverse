import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

// TAL-01
const body = z.object({
  categoryId: z.uuid(),
  displayName: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(1000).default(''),
  links: z.array(httpsLink).max(5).default([]),
  imageMediaId: z.string().optional(),
  evidenceMediaIds: z.array(z.string()).max(5).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  if (userRoles(u).includes('talent')) throw apiError('FORBIDDEN', 'You are already a talent.')
  await rateLimit(event, 'talent-application', u.id, 5, 3600)
  const input = await readJsonBody(event, body)
  rejectMediaIds(input.evidenceMediaIds)
  rejectMediaIds(input.imageMediaId)
  const db = useDb()
  const [cat] = await db.select().from(schema.category).where(eq(schema.category.id, input.categoryId)).limit(1)
  if (!cat?.active) throw apiError('VALIDATION_FAILED', 'Choose an active category.', { fields: { categoryId: cat ? 'inactive' : 'not_found' } })
  const [latest] = await db.select().from(schema.talentApplication).where(eq(schema.talentApplication.userId, u.id))
    .orderBy(desc(schema.talentApplication.submittedAt)).limit(1)
  if (latest?.status === 'pending') throw apiError('CONFLICT', 'You already have a pending application.', { existingId: latest.id })
  const reapplyAfter = latest?.status === 'declined' ? applicationView(latest).reapplyAfter : null
  if (reapplyAfter && new Date(reapplyAfter) > new Date()) throw apiError('INVALID_STATE', 'You can apply again later.', { reapplyAfter })
  const [row] = await db.insert(schema.talentApplication)
    .values({ userId: u.id, categoryId: input.categoryId, displayName: input.displayName, bio: input.bio, links: input.links })
    .onConflictDoNothing().returning()
  if (!row) {
    const [p] = await db.select({ id: schema.talentApplication.id }).from(schema.talentApplication)
      .where(and(eq(schema.talentApplication.userId, u.id), eq(schema.talentApplication.status, 'pending'))).limit(1)
    throw apiError('CONFLICT', 'You already have a pending application.', { existingId: p?.id })
  }
  setResponseStatus(event, 201)
  return applicationView(row)
})
