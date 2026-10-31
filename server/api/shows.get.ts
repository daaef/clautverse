import { and, asc, ilike } from 'drizzle-orm'
import { z } from 'zod'

// CAT-03
const query = z.object({
  categoryId: z.uuid().optional(),
  countryId: z.uuid().optional(),
  q: z.string().trim().max(60).optional(),
})

export default defineEventHandler(async (event) => {
  const { categoryId, countryId, q } = readQuery(event, query)
  const where = and(await activeShowFilter(categoryId, countryId), q ? ilike(schema.show.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`) : undefined)
  const rows = await useDb().select().from(schema.show).where(where).orderBy(asc(schema.show.name), asc(schema.show.id)).limit(200)
  return list(rows.map(s => ({ id: s.id, slug: s.slug, name: s.name, categoryId: s.categoryId, countryId: s.countryId })))
})
