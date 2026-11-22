import { eq } from 'drizzle-orm'
import { z } from 'zod'

// DROP-04: draft → scheduled|published; scheduled → published|rescheduled; published → no-op.
const body = z.object({ publishAt: z.iso.datetime({ offset: true }).optional() }).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { publishAt } = await readJsonBody(event, body)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadDrop(id, u, tx, true)
    if (!r.isAuthor && !isAdmin(u)) throw apiError('FORBIDDEN', 'Only the author can publish this drop.')
    if (isLive(r.drop)) return r.drop
    if (r.drop.status === 'archived' || r.drop.status === 'removed') throw apiError('INVALID_STATE', 'This drop can no longer be published.')
    const at = publishAt ? new Date(publishAt) : null
    const now = !at || at <= new Date()
    const [updated] = await tx.update(schema.drop).set({ status: now ? 'published' : 'scheduled', publishAt: now ? new Date() : at })
      .where(eq(schema.drop.id, id)).returning()
    if (now) await notifyDropPublished(tx, updated!)
    return updated!
  })
  const r = await loadDrop(id, u)
  return dropView(row, r.talent, true)
})
