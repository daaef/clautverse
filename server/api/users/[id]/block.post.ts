import { and, eq } from 'drizzle-orm'

// PRD §12: fan-initiated, one-directional block. Idempotent — a repeat returns the existing row.
const view = (b: typeof schema.block.$inferSelect) => ({ id: b.id, createdAt: b.createdAt.toISOString() })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const targetId = readUserIdParam(event)
  if (targetId === u.id) throw apiError('VALIDATION_FAILED', 'You cannot block yourself.', { fields: { id: 'self' } })
  const [target] = await useDb().select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.id, targetId)).limit(1)
  if (!target) throw apiError('NOT_FOUND', 'User not found.')
  const b = schema.block
  const findExisting = async () => (await useDb().select().from(b).where(and(eq(b.blockerId, u.id), eq(b.blockedId, targetId))).limit(1))[0]
  const existing = await findExisting()
  if (existing) return view(existing)
  try {
    const [row] = await useDb().insert(b).values({ blockerId: u.id, blockedId: targetId }).returning()
    setResponseStatus(event, 201)
    return view(row!)
  }
  catch (e) {
    const again = isUniqueViolation(e) ? await findExisting() : undefined
    if (again) return view(again)
    throw e
  }
})
