import { eq } from 'drizzle-orm'
import { z } from 'zod'

// ONB-02: save partial progress (or edit preferences after completion).
const body = z.object({
  categoryId: z.uuid().nullable().optional(),
  countryId: z.uuid().nullable().optional(),
  showIds: z.array(z.uuid()).max(20).optional(),
  seasonIds: z.array(z.uuid()).max(50).optional(),
  talentIds: z.array(z.uuid()).max(50).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  const input = await readJsonBody(event, body)
  const current = await loadOnboarding(me.id)
  const merged = await validateSelections({
    categoryId: input.categoryId !== undefined ? input.categoryId : current?.categoryId,
    countryId: input.countryId !== undefined ? input.countryId : current?.countryId,
    showIds: input.showIds ?? current?.showIds,
    seasonIds: input.seasonIds ?? current?.seasonIds,
    talentIds: input.talentIds ?? current?.talentIds,
  })
  if (me.onboardingStatus === 'completed' && (!merged.categoryId || !merged.showIds.length))
    throw apiError('VALIDATION_FAILED', 'Some selections are invalid.', { fields: { showIds: 'at least one show is required' } })
  const db = useDb()
  const now = new Date()
  const status = me.onboardingStatus === 'completed' ? 'completed' : 'in_progress'
  const [row] = await db.transaction(async (tx) => {
    if (status !== me.onboardingStatus) await tx.update(schema.user).set({ onboardingStatus: status }).where(eq(schema.user.id, me.id))
    return tx.insert(schema.onboarding).values({ userId: me.id, ...merged, updatedAt: now })
      .onConflictDoUpdate({ target: schema.onboarding.userId, set: { ...merged, updatedAt: now } }).returning()
  })
  return onboardingView(status, row)
})
