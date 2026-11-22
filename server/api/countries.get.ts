import { asc } from 'drizzle-orm'

// CAT-02: every country, for a Star's profile and application (plan decision 3).
export default defineEventHandler(async () => {
  const rows = await useDb().select({ id: schema.country.id, code: schema.country.code, name: schema.country.name })
    .from(schema.country).orderBy(asc(schema.country.name), asc(schema.country.id))
  return list(rows)
})
