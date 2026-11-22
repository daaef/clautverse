import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// BDG-02: public catalog so the UI can show badges not yet earned.
const query = z.object(pageQuery)

export default defineEventHandler(async (event) => {
  const { limit, cursor } = readQuery(event, query)
  const cur = readCursor<{ o: number, id: string }>(cursor, 'badges')
  const b = schema.badge
  const rows = await useDb().select().from(b).where(and(eq(b.active, true), cur ? sql`(${b.sortOrder}, ${b.id}) > (${cur.o}, ${cur.id}::uuid)` : undefined))
    .orderBy(asc(b.sortOrder), asc(b.id)).limit(limit + 1)
  return toPage(rows, limit, 'badges', r => ({ o: r.sortOrder, id: r.id }), badgeView)
})
