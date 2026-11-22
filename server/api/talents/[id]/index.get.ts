import { eq } from 'drizzle-orm'

// CAT-06
export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const db = useDb()
  const [t] = await db.select().from(schema.talent).where(eq(schema.talent.id, id))
  if (!t) throw apiError('NOT_FOUND', 'Talent not found.')
  const [country] = t.countryId
    ? await db.select({ id: schema.country.id, code: schema.country.code, name: schema.country.name }).from(schema.country).where(eq(schema.country.id, t.countryId))
    : []
  return {
    id: t.id, slug: t.slug, name: t.name, knownFor: t.knownFor, bio: t.bio, links: t.links, imageUrl: t.imageUrl,
    categoryId: t.categoryId, country: country ?? null, claimed: !!t.userId,
  }
})
