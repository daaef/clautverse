import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ADM-08
const body = z.object({
  talentId: z.uuid().optional(),
  name: z.string().trim().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(2).max(60).optional(),
  description: z.string().trim().max(2000).optional(),
  imageMediaId: z.string().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readJsonBody(event, body)
  rejectMediaIds(input.imageMediaId)
  const db = useDb()
  const row = await db.transaction(async (tx) => {
    if (input.talentId) {
      const [t] = await tx.select({ id: schema.talent.id }).from(schema.talent).where(eq(schema.talent.id, input.talentId)).limit(1)
      if (!t) throw apiError('VALIDATION_FAILED', 'Talent not found.', { fields: { talentId: 'not_found' } })
      const [owned] = await tx.select({ id: schema.community.id }).from(schema.community).where(eq(schema.community.ownerTalentId, input.talentId)).limit(1)
      if (owned) throw apiError('CONFLICT', 'This talent already has a community.', { existingId: owned.id })
    }
    let slug = input.slug
    if (slug) {
      const [clash] = await tx.select({ id: schema.community.id }).from(schema.community).where(eq(schema.community.slug, slug)).limit(1)
      if (clash) throw apiError('CONFLICT', 'That slug is taken.', { fields: { slug: 'taken' } })
    }
    else slug = await uniqueSlug(tx, schema.community, slugify(input.name))
    const [created] = await tx.insert(schema.community).values({ ownerTalentId: input.talentId, slug, name: input.name, description: input.description }).returning()
    await audit(tx, admin.id, 'community.created', 'community', created!.id, { talentId: input.talentId ?? null })
    return created!
  })
  setResponseStatus(event, 201)
  return communityDetail(row, null)
})
