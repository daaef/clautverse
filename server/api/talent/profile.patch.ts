import { eq } from 'drizzle-orm'
import { z } from 'zod'

// TAL-07: own linked profile only (no id in the path); status/isClaimed/userId not writable.
const body = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  knownFor: z.string().trim().max(80).nullable().optional(),
  countryId: z.uuid().nullable().optional(),
  bio: z.string().trim().max(1000).optional(),
  links: z.array(httpsLink).max(10).optional(),
  imageMediaId: z.string().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  if (!userRoles(u).includes('talent')) throw apiError('FORBIDDEN', 'Only talents can edit a talent profile.')
  const { imageMediaId, ...input } = await readJsonBody(event, body)
  rejectMediaIds(imageMediaId)
  if (input.countryId) {
    const [c] = await useDb().select({ id: schema.country.id }).from(schema.country).where(eq(schema.country.id, input.countryId)).limit(1)
    if (!c) throw apiError('VALIDATION_FAILED', 'Some fields are invalid.', { fields: { countryId: 'unknown' } })
  }
  const [t] = await useDb().update(schema.talent).set(input).where(eq(schema.talent.userId, u.id)).returning()
  if (!t) throw apiError('FORBIDDEN', 'No talent profile is linked to this account.')
  return talentView(t)
})
