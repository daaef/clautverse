import { eq } from 'drizzle-orm'

// DROP-05: author → archived; admin moderation → removed (audited). Idempotent 204.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  await useDb().transaction(async (tx) => {
    const [d] = await tx.select().from(schema.drop).where(eq(schema.drop.id, id)).for('update').limit(1)
    if (!d) throw apiError('NOT_FOUND', 'Drop not found.')
    const admin = isAdmin(u)
    if (d.authorId !== u.id && !admin) throw apiError(d.status === 'published' ? 'FORBIDDEN' : 'NOT_FOUND', 'You cannot delete this drop.')
    if (d.status === 'archived' || d.status === 'removed') return
    const status = d.authorId === u.id ? 'archived' : 'removed'
    await tx.update(schema.drop).set({ status }).where(eq(schema.drop.id, id))
    if (status === 'removed') await audit(tx, u.id, 'drop.removed', 'drop', id)
  })
  setResponseStatus(event, 204)
  return null
})
