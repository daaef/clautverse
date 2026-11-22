import { eq } from 'drizzle-orm'

// WP-04: host/owner/admin; not after ended|cancelled.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const input = await readJsonBody(event, partyPatchBody)
  const row = await useDb().transaction(async (tx) => {
    const r = await loadParty(id, u, tx, true)
    if (!r.isStaff) throw apiError('FORBIDDEN', 'Only the host can edit this watch party.')
    if (isClosedParty(r.party)) throw apiError('INVALID_STATE', 'This watch party is over.', { currentStatus: r.party.status })
    const startsAt = input.startsAt ? new Date(input.startsAt) : r.party.startsAt
    const endsAt = input.endsAt === undefined ? r.party.endsAt : input.endsAt ? new Date(input.endsAt) : null
    assertPartyTimes(startsAt, endsAt, !!input.startsAt)
    const [p] = await tx.update(schema.watchParty).set({ ...input, startsAt, endsAt, ...(input.startsAt ? { reminderSentAt: null } : {}) })
      .where(eq(schema.watchParty.id, id)).returning()
    if (isAdmin(u) && r.talent?.userId !== u.id && r.party.hostId !== u.id) await audit(tx, u.id, 'watch_party.updated', 'watch_party', id)
    return { p: p!, host: r.host }
  })
  return partyView(row.p, row.host)
})
