import { and, eq, sql } from 'drizzle-orm'

// DROP-07: idempotent 204.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  await useDb().transaction(async (tx) => {
    const gone = await tx.delete(schema.dropReaction).where(and(eq(schema.dropReaction.dropId, id), eq(schema.dropReaction.userId, u.id))).returning()
    if (gone.length) await tx.update(schema.drop).set({ likeCount: sql`greatest(${schema.drop.likeCount} - 1, 0)` }).where(eq(schema.drop.id, id))
  })
  setResponseStatus(event, 204)
  return null
})
