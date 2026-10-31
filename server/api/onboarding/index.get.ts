// ONB-01: resume onboarding where the user stopped.
export default defineEventHandler(async (event) => {
  const me = await requireUser(event)
  return onboardingView(me.onboardingStatus, await loadOnboarding(me.id))
})
