import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ADM-17: corrections are new ledger rows with a reason — never edits.
const body = z.object({ userId: z.string().min(1).max(100), amount: z.number().int().min(-100_000).max(100_000).refine(n => n !== 0, 'must not be 0'), reason: z.string().trim().min(1).max(500) }).strict()

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readJsonBody(event, body)
  const row = await useDb().transaction(async (tx) => {
    const [target] = await tx.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.id, input.userId)).limit(1)
    if (!target) throw apiError('NOT_FOUND', 'User not found.')
    const x = await grantXp(tx, { userId: input.userId, amount: input.amount, sourceType: 'admin_adjustment', sourceId: randomUUID(), actorId: admin.id, reason: input.reason })
    await audit(tx, admin.id, 'xp.adjusted', 'user', input.userId, { amount: input.amount, reason: input.reason, xpTransactionId: x.id })
    return x
  })
  setResponseStatus(event, 201)
  return xpView(row)
})
