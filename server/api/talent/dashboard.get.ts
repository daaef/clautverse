import { and, eq, gte, inArray, sql } from 'drizzle-orm'

// TAL-06: the caller's own talent + community headline numbers.
// newMembers7d = active members whose (latest) join was in the last 7 days.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  if (!userRoles(u).includes('talent')) throw apiError('FORBIDDEN', 'Only talents have a dashboard.')
  const db = useDb()
  const [t] = await db.select().from(schema.talent).where(eq(schema.talent.userId, u.id)).limit(1)
  if (!t) throw apiError('FORBIDDEN', 'No talent profile is linked to this account.')
  const [c] = await db.select().from(schema.community).where(eq(schema.community.ownerTalentId, t.id)).limit(1)
  if (!c) return { talent: talentView(t), community: null, stats: null }
  const m = schema.membership
  const [[nm], [pend], [wp]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(m).where(and(eq(m.communityId, c.id), eq(m.status, 'active'), gte(m.joinedAt, sql`now() - interval '7 days'`))),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.missionCompletion)
      .innerJoin(schema.mission, eq(schema.mission.id, schema.missionCompletion.missionId))
      .where(and(eq(schema.mission.communityId, c.id), eq(schema.missionCompletion.status, 'submitted'))),
    db.select({ n: sql<number>`count(*)::int`, rsvps: sql<number>`coalesce(sum(${schema.watchParty.rsvpCount}), 0)::int` }).from(schema.watchParty)
      .where(and(eq(schema.watchParty.communityId, c.id), inArray(schema.watchParty.status, ['scheduled', 'live']))),
  ])
  return {
    talent: talentView(t), community: communityCard(c, null),
    stats: { memberCount: c.memberCount, originalsCount: c.originalsAssigned, newMembers7d: nm!.n, pendingMissionApprovals: pend!.n, upcomingWatchParties: wp!.n, upcomingRsvps: wp!.rsvps },
  }
})
