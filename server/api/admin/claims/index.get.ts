import { and, asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-06
const query = z.object({ status: z.enum(['pending', 'verified', 'rejected']).default('pending'), ...pageQuery })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status, limit, cursor } = readQuery(event, query)
  const scope = `adm-claims-${status}`
  const c = readCursor<{ t: string, id: string }>(cursor, scope)
  const t = schema.identityClaim
  const rows = await useDb().select({ claim: t, claimant: schema.user, talent: schema.talent }).from(t)
    .innerJoin(schema.user, eq(schema.user.id, t.userId)).innerJoin(schema.talent, eq(schema.talent.id, t.talentId))
    .where(and(eq(t.status, status), c ? sql`(${t.submittedAt}, ${t.id}) > (${c.t}::timestamptz, ${c.id}::uuid)` : undefined))
    .orderBy(asc(t.submittedAt), asc(t.id)).limit(limit + 1)
  // The list omits evidence; opening a claim (ADM-07) shows it and is audited.
  return toPage(rows, limit, scope, r => ({ t: r.claim.submittedAt.toISOString(), id: r.claim.id }),
    r => ({ ...claimView(r.claim), talent: { id: r.talent.id, name: r.talent.name, slug: r.talent.slug }, claimant: { ...publicUser(r.claimant), email: r.claimant.email } }))
})
