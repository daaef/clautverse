import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-02: FIFO queue.
const query = z.object({ status: z.enum(['pending', 'accepted', 'declined']).default('pending'), ...pageQuery })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status, limit, cursor } = readQuery(event, query)
  const scope = `adm-apps-${status}`
  const c = readCursor<{ t: string, id: string }>(cursor, scope)
  const t = schema.talentApplication
  const rows = await useDb().select({ app: t, applicant: schema.user }).from(t).innerJoin(schema.user, eq(schema.user.id, t.userId))
    .where(and(eq(t.status, status), c ? sql`(${t.submittedAt}, ${t.id}) > (${c.t}::timestamptz, ${c.id}::uuid)` : undefined))
    .orderBy(asc(t.submittedAt), asc(t.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.app.submittedAt.toISOString(), id: r.app.id }),
    r => ({ ...adminApplicationView(r.app), applicant: { ...publicUser(r.applicant), email: r.applicant.email } }))
})
