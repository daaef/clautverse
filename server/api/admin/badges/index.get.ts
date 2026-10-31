import { asc } from 'drizzle-orm'

// ADM-16: all badges, including inactive ones.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const rows = await useDb().select().from(schema.badge).orderBy(asc(schema.badge.sortOrder), asc(schema.badge.id)).limit(500)
  return { items: rows.map(badgeView), nextCursor: null }
})
