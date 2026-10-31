import { and, eq, sql } from 'drizzle-orm'

// WP-07: idempotent "I'm going" on; the party row lock keeps rsvpCount exact.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event, { onboarded: true })
  const id = readIdParam(event)
  const going = true
  return useDb().transaction(async (tx) => {
    const r = await loadParty(id, u, tx, true)
    if (isClosedParty(r.party)) throw apiError('INVALID_STATE', 'This watch party is over.', { currentStatus: r.party.status })
    const rs = schema.watchPartyRsvp
    const changed = going
      ? await tx.insert(rs).values({ partyId: id, userId: u.id }).onConflictDoNothing().returning()
      : await tx.delete(rs).where(and(eq(rs.partyId, id), eq(rs.userId, u.id))).returning()
    let rsvpCount = r.party.rsvpCount
    if (changed.length) {
      const [p] = await tx.update(schema.watchParty).set({ rsvpCount: sql`${schema.watchParty.rsvpCount} + ${going ? 1 : -1}` })
        .where(eq(schema.watchParty.id, id)).returning({ rsvpCount: schema.watchParty.rsvpCount })
      rsvpCount = p!.rsvpCount
    }
    return { going, rsvpCount }
  })
})
