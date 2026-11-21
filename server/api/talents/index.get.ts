import { and, asc, eq, ilike } from 'drizzle-orm'
import { z } from 'zod'

// CAT-05 (renamed from PRD /api/stars): browse or search Stars, optionally within a category.
const query = z.object({
  categoryId: z.uuid().optional(),
  q: z.string().trim().max(60).optional(),
})

export default defineEventHandler(async (event) => {
  const { categoryId, q } = readQuery(event, query)
  const t = schema.talent
  const rows = await useDb().select({ id: t.id, slug: t.slug, name: t.name, knownFor: t.knownFor, imageUrl: t.imageUrl, categoryId: t.categoryId })
    .from(t)
    .where(and(
      categoryId ? eq(t.categoryId, categoryId) : undefined,
      q ? ilike(t.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`) : undefined,
    ))
    .orderBy(asc(t.name), asc(t.id))
    .limit(200)
  return list(rows)
})
