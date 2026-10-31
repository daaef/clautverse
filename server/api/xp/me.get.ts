import { eq, sql } from 'drizzle-orm'

// XP-01: XP is a score only at launch — no thresholds.
export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const x = schema.xpTransaction
  const [r] = await useDb().select({
    balance: sql<number>`coalesce(sum(${x.amount}), 0)::int`,
    lifetimeEarned: sql<number>`coalesce(sum(${x.amount}) filter (where ${x.amount} > 0), 0)::int`,
  }).from(x).where(eq(x.userId, u.id))
  return r!
})
