import { eq } from 'drizzle-orm'

// ADM-16: edit or deactivate (badges are never deleted; awards stay).
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const input = await readJsonBody(event, badgePatch)
  const row = await useDb().transaction(async (tx) => {
    const [b] = await tx.update(schema.badge).set(input).where(eq(schema.badge.id, id)).returning()
    if (!b) throw apiError('NOT_FOUND', 'Badge not found.')
    await audit(tx, admin.id, 'badge.updated', 'badge', id, input)
    return b
  })
  return badgeView(row)
})
