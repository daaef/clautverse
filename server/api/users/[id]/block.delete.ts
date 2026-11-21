import { and, eq } from 'drizzle-orm'

// Unblock deletes the row; deleting a block that does not exist still succeeds (idempotent).
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const targetId = readUserIdParam(event)
  const b = schema.block
  await useDb().delete(b).where(and(eq(b.blockerId, u.id), eq(b.blockedId, targetId)))
  return { blocked: false }
})
