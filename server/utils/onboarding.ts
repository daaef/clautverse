import { eq } from 'drizzle-orm'

export async function loadOnboarding(userId: string) {
  const [row] = await useDb().select().from(schema.onboarding).where(eq(schema.onboarding.userId, userId))
  return row
}

export function onboardingView(status: string, row?: typeof schema.onboarding.$inferSelect) {
  const selections = {
    categoryId: row?.categoryId ?? null,
    talentIds: row?.talentIds ?? [],
  }
  const nextStep = status === 'completed' ? null
    : !selections.categoryId ? 'category'
    : !selections.talentIds.length ? 'stars'
    : 'review'
  return { status, selections, nextStep, completedAt: row?.completedAt?.toISOString() ?? null }
}
