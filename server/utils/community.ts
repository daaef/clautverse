import type { H3Event } from 'h3'
import { and, eq, inArray } from 'drizzle-orm'

type Community = typeof schema.community.$inferSelect
type Membership = typeof schema.membership.$inferSelect

export const ORIGINALS_CAP = 100

/** Signed-in viewer if any; never throws. */
export async function optionalUser(event: H3Event) {
  const session = await useAuth().api.getSession({ headers: event.headers }).catch(() => null)
  if (!session) return null
  const [u] = await useDb().select().from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1)
  return u && u.status === 'active' ? u : null
}

export const isAdmin = (u: DbUser | null | undefined) => !!u && userRoles(u).includes(SUPER_ADMIN)

export const membershipView = (m: Membership) => ({
  id: m.id, communityId: m.communityId, status: m.status, alertsEnabled: m.alertsEnabled, lane: m.lane,
  originalPosition: m.status === 'removed' ? null : m.originalPosition,
  joinedAt: m.joinedAt.toISOString(), leftAt: m.leftAt?.toISOString() ?? null,
})

export const communityCard = (c: Community, viewer: Membership | null | undefined) => ({
  id: c.id, slug: c.slug, name: c.name, imageUrl: c.imageUrl, talentId: c.ownerTalentId, status: c.status,
  memberCount: c.memberCount, originalsAssigned: c.originalsAssigned, createdAt: c.createdAt.toISOString(),
  viewerMembership: viewer ? membershipView(viewer) : null,
})

export const communityDetail = (c: Community, viewer: Membership | null | undefined) => ({
  ...communityCard(c, viewer), description: c.description, rules: c.rules, originalsCap: ORIGINALS_CAP,
})

export async function viewerMemberships(userId: string | undefined, communityIds: string[]) {
  if (!userId || !communityIds.length) return new Map<string, Membership>()
  const rows = await useDb().select().from(schema.membership)
    .where(and(eq(schema.membership.userId, userId), inArray(schema.membership.communityId, communityIds)))
  return new Map(rows.map(r => [r.communityId, r]))
}

/** Vetoed communities are 404 for everyone except admins. */
export async function loadVisibleCommunity(id: string, viewer: DbUser | null, tx: DbOrTx = useDb(), lock = false) {
  const q = tx.select().from(schema.community).where(eq(schema.community.id, id)).limit(1)
  const [c] = lock ? await q.for('update') : await q
  if (!c || (c.status === 'vetoed' && !isAdmin(viewer))) throw apiError('NOT_FOUND', 'Community not found.')
  return c
}

export async function isCommunityOwner(c: Community, userId: string, tx: DbOrTx = useDb()) {
  if (!c.ownerTalentId) return false
  const [t] = await tx.select({ userId: schema.talent.userId }).from(schema.talent).where(eq(schema.talent.id, c.ownerTalentId)).limit(1)
  return t?.userId === userId
}
