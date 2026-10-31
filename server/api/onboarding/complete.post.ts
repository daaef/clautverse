import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ONB-03: Reality TV (an active category) + at least one show required; the rest optional (decision 2b).
const body = z.object({
  categoryId: z.uuid(),
  countryId: z.uuid().nullable().optional(),
  showIds: z.array(z.uuid()).min(1, 'pick at least one show').max(20),
  seasonIds: z.array(z.uuid()).max(50).optional(),
  talentIds: z.array(z.uuid()).max(50).optional(),
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
