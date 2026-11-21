import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ONB-03: an active category + at least one favourite Star from it (PRD §6.1; plan decision 2).
const body = z.object({
  categoryId: z.uuid(),
  talentIds: z.array(z.uuid()).min(1, 'pick at least one Star').max(50),
}).strict()

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  await rateLimit(event, 'onboarding-complete', me.id, 20, 60)
  const input = await readJsonBody(event, body)
  const sel = await validateSelections(input)
  const db = useDb()
  const now = new Date()
  const [row] = await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ onboardingStatus: 'completed', updatedAt: now }).where(eq(schema.user.id, me.id))
    return tx.insert(schema.onboarding).values({ userId: me.id, ...sel, completedAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: schema.onboarding.userId, set: { ...sel, completedAt: now, updatedAt: now } }).returning()
  })
  return onboardingView('completed', row)
})
