import { eq } from 'drizzle-orm'

// ADM-16
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [b] = await useDb().select().from(schema.badge).where(eq(schema.badge.id, readIdParam(event))).limit(1)
  if (!b) throw apiError('NOT_FOUND', 'Badge not found.')
  return badgeView(b)
})
