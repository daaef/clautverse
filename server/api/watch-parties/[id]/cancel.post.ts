import { eq } from 'drizzle-orm'

// WP-05: repeat → 200; RSVP'd fans notified once.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadParty(id, u, tx, true)
    if (!r.isStaff) throw apiError('FORBIDDEN', 'Only the host can cancel this watch party.')
    if (r.party.status === 'cancelled') return { p: r.party, host: r.host }
    if (r.party.status === 'ended') throw apiError('INVALID_STATE', 'This watch party has ended.', { currentStatus: r.party.status })
    const [p] = await tx.update(schema.watchParty).set({ status: 'cancelled' }).where(eq(schema.watchParty.id, id)).returning()
    await notifyRsvps(tx, id, 'watch_party.cancelled')
    if (isAdmin(u) && r.talent?.userId !== u.id && r.party.hostId !== u.id) await audit(tx, u.id, 'watch_party.cancelled', 'watch_party', id)
    return { p: p!, host: r.host }
  })
  return partyView(row.p, row.host)
})
