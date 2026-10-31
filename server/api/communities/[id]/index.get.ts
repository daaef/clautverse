// COM-02
export default defineEventHandler(async (event) => {
  const id = readIdParam(event)
  const viewer = await optionalUser(event)
  const c = await loadVisibleCommunity(id, viewer)
  const mine = await viewerMemberships(viewer?.id, [c.id])
  return communityDetail(c, mine.get(c.id))
})
