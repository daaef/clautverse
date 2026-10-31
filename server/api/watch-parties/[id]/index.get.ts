// WP-02: public share-page payload.
export default defineEventHandler(async (event) => {
  const viewer = await optionalUser(event)
  const r = await loadParty(readIdParam(event), viewer)
  const going = await viewerRsvps(viewer?.id, [r.party.id])
  return partyView(r.party, r.host, going.has(r.party.id))
})
