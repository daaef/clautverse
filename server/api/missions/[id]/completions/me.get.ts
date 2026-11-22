import { and, eq } from 'drizzle-orm'

// MIS-07: one completion per fan at launch, so this is a 0–1 item list.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const r = await loadMission(readIdParam(event), u)
  const mc = schema.missionCompletion
  const rows = await useDb().select().from(mc).where(and(eq(mc.missionId, r.mission.id), eq(mc.userId, u.id)))
  return { items: rows.map(completionView), nextCursor: null }
})
