import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// COM-06. `lane` will be added here once lanes are defined (additive change).
const body = z.object({ alertsEnabled: z.boolean() }).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { alertsEnabled } = await readJsonBody(event, body)
  const m = schema.membership
  const db = useDb()
  const [row] = await db.select().from(m).where(and(eq(m.id, id), eq(m.userId, u.id))).limit(1)
  if (!row) throw apiError('NOT_FOUND', 'Membership not found.')
  if (row.status !== 'active') throw apiError('INVALID_STATE', 'This membership is not active.')
  const [updated] = await db.update(m).set({ alertsEnabled }).where(eq(m.id, id)).returning()
  return membershipView(updated!)
})
