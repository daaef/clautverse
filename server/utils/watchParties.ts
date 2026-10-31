import { and, eq, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'

type Party = typeof schema.watchParty.$inferSelect
type UserLite = Parameters<typeof publicUser>[0]

export const isIanaTimeZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz })
    return tz.includes('/') || tz === 'UTC'
  }
  catch { return false }
}

const fields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullable(),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
  timeZone: z.string().max(64).refine(isIanaTimeZone, 'Use an IANA time zone such as Africa/Lagos.'),
  link: z.url({ protocol: /^https$/ }).max(500).nullable(),
}
export const partyCreateBody = z.object({ communityId: z.uuid(), ...fields, description: fields.description.optional(), endsAt: fields.endsAt.optional(), link: fields.link.optional() }).strict()
export const partyPatchBody = z.object(fields).partial().strict()

export function assertPartyTimes(startsAt: Date, endsAt: Date | null | undefined, startChanged: boolean) {
  if (startChanged && startsAt <= new Date()) throw apiError('VALIDATION_FAILED', 'Start time must be in the future.', { fields: { startsAt: 'past' } })
  if (endsAt && endsAt <= startsAt) throw apiError('VALIDATION_FAILED', 'End time must be after the start time.', { fields: { endsAt: 'before_start' } })
}

export const partyView = (p: Party, host: UserLite | null, viewerRsvp = false) => ({
  id: p.id, communityId: p.communityId, host: host ? publicUser(host) : null, title: p.title, description: p.description,
  startsAt: p.startsAt.toISOString(), endsAt: p.endsAt?.toISOString() ?? null, timeZone: p.timeZone, link: p.link,
  status: p.status, rsvpCount: p.rsvpCount, viewerRsvp, createdAt: p.createdAt.toISOString(),
})

export const isClosedParty = (p: Party) => p.status === 'ended' || p.status === 'cancelled'

/** Staff = admin, community owner or host. Vetoed community → 404 for everyone else. */
export async function loadParty(id: string, viewer: DbUser | null, tx: DbOrTx = useDb(), lock = false) {
  const q = tx.select({ party: schema.watchParty, community: schema.community, talent: schema.talent, host: schema.user }).from(schema.watchParty)
    .innerJoin(schema.community, eq(schema.community.id, schema.watchParty.communityId))
    .leftJoin(schema.talent, eq(schema.talent.id, schema.community.ownerTalentId))
    .leftJoin(schema.user, eq(schema.user.id, schema.watchParty.hostId))
    .where(eq(schema.watchParty.id, id)).limit(1)
  const [r] = lock ? await q.for('update', { of: schema.watchParty }) : await q
  const admin = isAdmin(viewer)
  if (!r || (r.community.status === 'vetoed' && !admin)) throw apiError('NOT_FOUND', 'Watch party not found.')
  const isStaff = admin || (!!viewer && (r.talent?.userId === viewer.id || r.party.hostId === viewer.id))
  return { ...r, isStaff }
}

export async function viewerRsvps(userId: string | undefined, ids: string[]) {
  if (!userId || !ids.length) return new Set<string>()
  const rows = await useDb().select({ id: schema.watchPartyRsvp.partyId }).from(schema.watchPartyRsvp)
    .where(and(eq(schema.watchPartyRsvp.userId, userId), inArray(schema.watchPartyRsvp.partyId, ids)))
  return new Set(rows.map(r => r.id))
}

export async function notifyRsvps(tx: DbOrTx, partyId: string, type: string) {
  await tx.execute(sql`insert into notification (user_id, type, data)
    select r.user_id, ${type}, jsonb_build_object('partyId', ${partyId}::text) from watch_party_rsvp r where r.party_id = ${partyId}`)
}
