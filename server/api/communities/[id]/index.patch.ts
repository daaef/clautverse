import { eq } from 'drizzle-orm'
import { z } from 'zod'

// COM-10: owner or admin; status is not writable here (veto is ADM-09).
const body = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  rules: z.string().trim().max(4000).nullable().optional(),
  imageMediaId: z.string().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { imageMediaId, ...input } = await readJsonBody(event, body)
  rejectMediaIds(imageMediaId)
  const c = await useDb().transaction(async (tx) => {
    const comm = await loadVisibleCommunity(id, u, tx, true)
    const owner = await isCommunityOwner(comm, u.id, tx)
    if (!owner && !isAdmin(u)) throw apiError('FORBIDDEN', 'Only the community\'s talent can edit it.')
    const [row] = await tx.update(schema.community).set(input).where(eq(schema.community.id, id)).returning()
    if (!owner) await audit(tx, u.id, 'community.updated', 'community', id, input)
    return row!
  })
  return communityDetail(c, null)
})
