import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// RPT-01: one open report per (reporter, target); repeat returns the existing report.
const body = z.object({
  targetType: z.enum(['drop', 'reply', 'user', 'community', 'mission']),
  targetId: z.string().trim().min(1).max(100),
  reason: z.enum(['spam', 'harassment', 'hate', 'sexual', 'impersonation', 'other']),
  details: z.string().trim().max(1000).optional(),
}).strict()

const view = (r: typeof schema.report.$inferSelect) => ({ id: r.id, status: r.status, createdAt: r.createdAt.toISOString() })

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const input = await readJsonBody(event, body)
  const rp = schema.report
  const findOpen = async () => (await useDb().select().from(rp).where(and(eq(rp.reporterId, u.id), eq(rp.targetType, input.targetType), eq(rp.targetId, input.targetId), eq(rp.status, 'open'))).limit(1))[0]
  const existing = await findOpen()
  if (existing) return view(existing)
  await rateLimit(event, 'report', u.id, 10, 60)
  await assertReportTarget(input.targetType, input.targetId, u)
  try {
    const [row] = await useDb().insert(rp).values({ reporterId: u.id, ...input, details: input.details || null }).returning()
    setResponseStatus(event, 201)
    return view(row!)
  }
  catch (e) {
    const again = isUniqueViolation(e) ? await findOpen() : undefined
    if (again) return view(again)
    throw e
  }
})
