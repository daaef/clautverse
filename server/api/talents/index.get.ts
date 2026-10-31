import { and, asc, eq, ilike, inArray } from 'drizzle-orm'
import { z } from 'zod'

// CAT-05 (renamed from PRD /api/stars)
const query = z.object({
  seasonId: z.uuid().optional(),
  showId: z.uuid().optional(),
  q: z.string().trim().max(60).optional(),
})

export default defineEventHandler(async (event) => {
  const { seasonId, showId, q } = readQuery(event, query)
  const db = useDb()
  let seasonIds: string[] | undefined
  if (seasonId) seasonIds = [seasonId]
  else if (showId) seasonIds = (await db.select({ id: schema.season.id }).from(schema.season).where(eq(schema.season.showId, showId))).map(r => r.id)
  if (seasonIds && !seasonIds.length) return list([])
  const rows = await db.selectDistinct({ id: schema.talent.id, slug: schema.talent.slug, name: schema.talent.name, imageUrl: schema.talent.imageUrl })
    .from(schema.talent)
    .leftJoin(schema.seasonTalent, eq(schema.seasonTalent.talentId, schema.talent.id))
    .where(and(
      seasonIds ? inArray(schema.seasonTalent.seasonId, seasonIds) : undefined,
      q ? ilike(schema.talent.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`) : undefined,
    ))
    .orderBy(asc(schema.talent.name), asc(schema.talent.id))
    .limit(200)
  return list(rows)
})
