// MIS-02
export default defineEventHandler(async (event) => {
  const viewer = await optionalUser(event)
  const r = await loadMission(readIdParam(event), viewer)
  const mine = await viewerCompletions(viewer?.id, [r.mission.id])
  return missionView(r.mission, r.creator, mine.get(r.mission.id) ?? null)
})
