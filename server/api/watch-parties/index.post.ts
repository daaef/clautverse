import { sql } from 'drizzle-orm'

// WP-03: owner/admin; notifies members with alerts on.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const key = idempotencyHeader(event)
  const input = await readJsonBody(event, partyCreateBody)
  const replay = await findIdempotent(u.id, 'party.create', key)
  if (replay) {
    const r = await loadParty(replay, u)
    setResponseStatus(event, 201)
    return partyView(r.party, r.host)
  }
  const comm = await loadVisibleCommunity(input.communityId, u)
  if (!isAdmin(u) && !(await isCommunityOwner(comm, u.id))) throw apiError('FORBIDDEN', 'Only the community\'s talent can create watch parties.')
  const startsAt = new Date(input.startsAt)
  const endsAt = input.endsAt ? new Date(input.endsAt) : null
  assertPartyTimes(startsAt, endsAt, true)
  const p = await useDb().transaction(async (tx) => {
    const [row] = await tx.insert(schema.watchParty).values({
      communityId: comm.id, hostId: u.id, title: input.title, description: input.description ?? null,
      startsAt, endsAt, timeZone: input.timeZone, link: input.link ?? null,
    }).returning()
    await tx.execute(sql`insert into notification (user_id, type, data)
      select m.user_id, 'watch_party.created', jsonb_build_object('partyId', ${row!.id}::text, 'communityId', ${comm.id}::text)
      from membership m where m.community_id = ${comm.id} and m.status = 'active' and m.alerts_enabled and m.user_id <> ${u.id}`)
    await saveIdempotent(tx, u.id, 'party.create', key, row!.id)
    return row!
  })
  setResponseStatus(event, 201)
  return partyView(p, u)
})
