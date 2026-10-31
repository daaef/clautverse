import { asc } from 'drizzle-orm'

// CAT-01: inactive categories are listed as "coming soon" but not selectable.
export default defineEventHandler(async () => {
  const rows = await useDb().select().from(schema.category).orderBy(asc(schema.category.sortOrder), asc(schema.category.id))
  return list(rows.map(c => ({ id: c.id, slug: c.slug, name: c.name, active: c.active })))
})
