import { count, eq, gte, sql } from 'drizzle-orm'

// ADM-01
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDb()
  const n = async (q: Promise<{ n: number }[]>) => Number((await q)[0]?.n ?? 0)
  const [pendingApplications, pendingClaims, activeCommunities, users, newUsers7d] = await Promise.all([
    n(db.select({ n: count() }).from(schema.talentApplication).where(eq(schema.talentApplication.status, 'pending'))),
    n(db.select({ n: count() }).from(schema.identityClaim).where(eq(schema.identityClaim.status, 'pending'))),
    n(db.select({ n: count() }).from(schema.community).where(eq(schema.community.status, 'active'))),
    n(db.select({ n: count() }).from(schema.user)),
    n(db.select({ n: count() }).from(schema.user).where(gte(schema.user.createdAt, sql`now() - interval '7 days'`))),
  ])
  // openReports is 0 until the reports domain ships.
  return { counts: { pendingApplications, pendingClaims, openReports: 0, activeCommunities, users, newUsers7d } }
})
