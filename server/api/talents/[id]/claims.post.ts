import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// TAL-04
const body = z.object({
  evidenceLinks: z.array(z.url({ protocol: /^https$/ }).max(500)).max(5).default([]),
  evidenceMediaIds: z.array(z.string()).max(5).optional(),
  message: z.string().trim().max(1000).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  await rateLimit(event, 'identity-claim', u.id, 10, 3600)
  const input = await readJsonBody(event, body)
  rejectMediaIds(input.evidenceMediaIds)
  if (!input.evidenceLinks.length) throw apiError('VALIDATION_FAILED', 'Add at least one piece of evidence.', { fields: { evidenceLinks: 'required' } })
  const db = useDb()
  const [tal] = await db.select().from(schema.talent).where(eq(schema.talent.id, id)).limit(1)
  if (!tal) throw apiError('NOT_FOUND', 'Talent not found.')
  if (tal.userId) throw apiError('INVALID_STATE', 'This profile has already been claimed.')
  const c = schema.identityClaim
  const [row] = await db.insert(c).values({ talentId: id, userId: u.id, evidenceLinks: input.evidenceLinks, message: input.message })
    .onConflictDoNothing().returning()
  if (!row) {
    const [p] = await db.select({ id: c.id }).from(c).where(and(eq(c.userId, u.id), eq(c.talentId, id), eq(c.status, 'pending'))).limit(1)
    throw apiError('CONFLICT', 'You already have a pending claim on this profile.', { existingId: p?.id })
  }
  setResponseStatus(event, 201)
  return claimView(row)
})
