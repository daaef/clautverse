import { eq } from 'drizzle-orm'

// ADM-11a: suspended → active; already active is a no-op.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readUserIdParam(event)
  const input = await readJsonBody(event, adminActionBody)
  const u = await useDb().transaction(async (tx) => {
    const [target] = await tx.select().from(schema.user).where(eq(schema.user.id, id)).for('update').limit(1)
    if (!target) throw apiError('NOT_FOUND', 'User not found.')
    if (target.status !== 'suspended') return target
    const [updated] = await tx.update(schema.user).set({ status: 'active' }).where(eq(schema.user.id, id)).returning()
    await audit(tx, admin.id, 'user.reinstated', 'user', id, { reason: input.reason, internalNote: input.internalNote ?? null })
    return updated!
  })
  return adminUserView(u)
})
