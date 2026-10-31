import { eq } from 'drizzle-orm'
import { z } from 'zod'

// DROP-03: drafts/scheduled fully editable; published drops allow body/teaser only.
const body = z.object({
  body: z.string().trim().min(1).max(5000).optional(),
  teaser: z.string().trim().max(100).nullable().optional(),
  audience: z.enum(['public', 'members', 'originals_only']).optional(),
  publishAt: z.iso.datetime({ offset: true }).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const input = await readJsonBody(event, body)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadDrop(id, u, tx, true)
    if (!r.isAuthor && !isAdmin(u)) throw apiError('FORBIDDEN', 'Only the author can edit this drop.')
    const d = r.drop
    if (d.status === 'archived' || d.status === 'removed') throw apiError('INVALID_STATE', 'This drop can no longer be edited.')
    const patch: Partial<typeof schema.drop.$inferInsert> = {}
    if (input.body !== undefined) patch.body = input.body
    if (input.teaser !== undefined) patch.teaser = input.teaser || null
    if (isLive(d)) {
      if ((input.audience && input.audience !== d.audience) || input.publishAt) throw apiError('INVALID_STATE', 'Only text and teaser can change after publishing.')
      patch.editedAt = new Date()
    }
    else {
      if (input.audience) patch.audience = input.audience
      if (input.publishAt) {
        const at = new Date(input.publishAt)
        if (at <= new Date()) throw apiError('VALIDATION_FAILED', 'publishAt must be in the future.', { fields: { publishAt: 'past' } })
        Object.assign(patch, { publishAt: at, status: 'scheduled' })
      }
    }
    if (!Object.keys(patch).length) return r
    const [updated] = await tx.update(schema.drop).set(patch).where(eq(schema.drop.id, id)).returning()
    return { ...r, drop: updated! }
  })
  return dropView(row.drop, row.talent, true)
})
