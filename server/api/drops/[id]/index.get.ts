import { and, eq } from 'drizzle-orm'

// DROP-02
export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const viewer = await optionalUser(event)
  const r = await loadDrop(id, viewer)
  const liked = viewer && r.canSee
    ? !!(await useDb().select().from(schema.dropReaction).where(and(eq(schema.dropReaction.dropId, id), eq(schema.dropReaction.userId, viewer.id))).limit(1))[0]
    : false
  return dropView(r.drop, r.talent, r.canSee, liked)
})
