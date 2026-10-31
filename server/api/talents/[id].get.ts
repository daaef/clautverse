import { eq } from 'drizzle-orm'

// CAT-06
export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const db = useDb()
  const [t] = await db.select().from(schema.talent).where(eq(schema.talent.id, id))
  if (!t) throw apiError('NOT_FOUND', 'Talent not found.')
  const seasons = await db.select({ id: schema.season.id, name: schema.season.name, number: schema.season.number, showId: schema.season.showId })
    .from(schema.seasonTalent).innerJoin(schema.season, eq(schema.season.id, schema.seasonTalent.seasonId))
    .where(eq(schema.seasonTalent.talentId, id))
  return { id: t.id, slug: t.slug, name: t.name, bio: t.bio, imageUrl: t.imageUrl, claimed: !!t.userId, seasons }
})
