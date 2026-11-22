import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// DROP-08: entitled viewers only; conversation order; removed replies become placeholders.
const query = z.object(pageQuery)

export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const { limit, cursor } = readQuery(event, query)
  const viewer = await optionalUser(event)
  const r = await loadDrop(id, viewer)
  if (!r.canSee) throw apiError('FORBIDDEN', 'Join to unlock this drop.', { reason: 'locked' })
  const scope = `replies-${id}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const rp = schema.reply
  const blocked = await blockedAuthorIds(viewer?.id)
  const rows = await useDb().select({ reply: rp, author: schema.user }).from(rp).leftJoin(schema.user, eq(schema.user.id, rp.authorId))
    .where(and(eq(rp.dropId, id), notAuthoredByBlocked(rp.authorId, blocked), cur ? sql`(${rp.createdAt}, ${rp.id}) > (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(asc(rp.createdAt), asc(rp.id)).limit(limit + 1)
  return toPage(rows, limit, scope, x => ({ t: x.reply.createdAt.toISOString(), id: x.reply.id }),
    x => replyView(x.reply, x.author && x.author.status === 'active' ? x.author : null))
})
