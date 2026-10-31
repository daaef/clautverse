import { and, desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// BDG-01
const query = z.object(pageQuery)

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const { limit, cursor } = readQuery(event, query)
  const cur = readCursor<{ t: string, id: string }>(cursor, 'badges-me')
  const a = schema.badgeAward
  const rows = await useDb().select({ award: a, badge: schema.badge }).from(a).innerJoin(schema.badge, eq(schema.badge.id, a.badgeId))
    .where(and(eq(a.userId, u.id), cur ? sql`(${a.awardedAt}, ${a.badgeId}) < (${cur.t}::timestamptz, ${cur.id}::uuid)` : undefined))
    .orderBy(desc(a.awardedAt), desc(a.badgeId)).limit(limit + 1)
  return toPage(rows, limit, 'badges-me', r => ({ t: r.award.awardedAt.toISOString(), id: r.badge.id }),
    r => ({ badge: badgeView(r.badge), awardedAt: r.award.awardedAt.toISOString() }))
})
