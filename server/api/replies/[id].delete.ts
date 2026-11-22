import { eq, sql } from 'drizzle-orm'

// DROP-10: author → deleted; community owner or admin → removed (admin audited). Idempotent 204.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  await useDb().transaction(async (tx) => {
    const [x] = await tx.select().from(schema.reply).where(eq(schema.reply.id, id)).for('update').limit(1)
    if (!x) throw apiError('NOT_FOUND', 'Reply not found.')
    const r = await loadDrop(x.dropId, u, tx).catch(() => null)
    const admin = isAdmin(u)
    const isAuthor = x.authorId === u.id
    if (!isAuthor && !admin && !(r?.isStaff)) throw apiError('FORBIDDEN', 'You cannot delete this reply.')
    if (x.status !== 'active') return
    await tx.update(schema.reply).set({ status: isAuthor ? 'deleted' : 'removed' }).where(eq(schema.reply.id, id))
    await tx.update(schema.drop).set({ replyCount: sql`greatest(${schema.drop.replyCount} - 1, 0)` }).where(eq(schema.drop.id, x.dropId))
    if (!isAuthor && admin) await audit(tx, u.id, 'reply.removed', 'reply', id)
  })
  setResponseStatus(event, 204)
  return null
})
