import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

// CAT-02: countries that have at least one active show (in the category, if given).
const query = z.object({ categoryId: z.uuid().optional() })

export default defineEventHandler(async (event) => {
  const { categoryId } = readQuery(event, query)
  const rows = await useDb().selectDistinct({ id: schema.country.id, code: schema.country.code, name: schema.country.name })
    .from(schema.country)
    .innerJoin(schema.show, eq(schema.show.countryId, schema.country.id))
    .where(await activeShowFilter(categoryId))
    .orderBy(asc(schema.country.name), asc(schema.country.id))
  return list(rows)
})
