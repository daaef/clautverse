import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ADM-09a: memberships and Originals positions are preserved; veto only hides the community.
const body = z.object({ internalNote: z.string().trim().max(2000).optional() }).strict()

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { internalNote } = await readJsonBody(event, body)
  const c = schema.community
  const row = await useDb().transaction(async (tx) => {
    const [comm] = await tx.select().from(c).where(eq(c.id, id)).for('update').limit(1)
    if (!comm) throw apiError('NOT_FOUND', 'Community not found.')
    if (comm.status === 'active') return comm
    const [updated] = await tx.update(c).set({ status: 'active' }).where(eq(c.id, id)).returning()
    await audit(tx, admin.id, 'community.restored', 'community', id, internalNote ? { internalNote } : {})
    return updated!
  })
  return communityDetail(row, null)
})
