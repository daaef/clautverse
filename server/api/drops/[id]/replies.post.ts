import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// DROP-09: active members (or staff) entitled to the drop; one level of nesting.
const body = z.object({ body: z.string().trim().min(1).max(1000), parentReplyId: z.uuid().optional() }).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event, { onboarded: true })
  const id = readIdParam(event)
  const key = idempotencyHeader(event)
  const input = await readJsonBody(event, body)
  const replay = await findIdempotent(u.id, `reply.create:${id}`, key)
  if (replay) {
    const [x] = await useDb().select().from(schema.reply).where(eq(schema.reply.id, replay)).limit(1)
    setResponseStatus(event, 201)
    return replyView(x!, u)
  }
  await rateLimit(event, 'reply', u.id, 30, 60)
  const created = await useDb().transaction(async (tx) => {
    const r = await loadDrop(id, u, tx)
    if (!isLive(r.drop)) throw apiError('INVALID_STATE', 'This drop is not published.')
    if (!r.canSee) throw apiError('FORBIDDEN', 'Join to unlock this drop.', { reason: 'locked' })
    if (!r.isStaff && r.membership?.status !== 'active') throw apiError('FORBIDDEN', 'Join this community to reply.', { reason: 'not_member' })
    let parent: typeof schema.reply.$inferSelect | undefined
    if (input.parentReplyId) {
      [parent] = await tx.select().from(schema.reply).where(eq(schema.reply.id, input.parentReplyId)).limit(1)
      if (!parent || parent.dropId !== id || parent.parentReplyId || parent.status !== 'active')
        throw apiError('VALIDATION_FAILED', 'You can only reply to a top-level reply on this drop.', { fields: { parentReplyId: 'invalid' } })
    }
    const [row] = await tx.insert(schema.reply).values({ dropId: id, authorId: u.id, body: input.body, parentReplyId: parent?.id ?? null }).returning()
    await tx.update(schema.drop).set({ replyCount: sql`${schema.drop.replyCount} + 1` }).where(eq(schema.drop.id, id))
    await saveIdempotent(tx, u.id, `reply.create:${id}`, key, row!.id)
    if (parent?.authorId && parent.authorId !== u.id) await notify(tx, parent.authorId, 'reply.replied', { dropId: id, replyId: row!.id, parentReplyId: parent.id })
    return row!
  })
  setResponseStatus(event, 201)
  return replyView(created, u)
})
