import { eq, sql } from 'drizzle-orm'

// DROP-06: one like per fan per drop; repeating is a no-op.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event, { onboarded: true })
  const id = readIdParam(event)
  const likes = await useDb().transaction(async (tx) => {
    const r = await loadDrop(id, u, tx)
    if (!isLive(r.drop)) throw apiError('INVALID_STATE', 'This drop is not published.')
    if (!r.canSee) throw apiError('FORBIDDEN', 'Join to unlock this drop.', { reason: 'locked' })
    const added = await tx.insert(schema.dropReaction).values({ dropId: id, userId: u.id }).onConflictDoNothing().returning()
    const [d] = added.length
      ? await tx.update(schema.drop).set({ likeCount: sql`${schema.drop.likeCount} + 1` }).where(eq(schema.drop.id, id)).returning({ n: schema.drop.likeCount })
      : await tx.select({ n: schema.drop.likeCount }).from(schema.drop).where(eq(schema.drop.id, id))
    return d!.n
  })
  return { dropId: id, type: 'like', reactionCounts: { like: likes } }
})
