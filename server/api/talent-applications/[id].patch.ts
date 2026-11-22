import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// TAL-03: edit a pending application.
const body = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(1000).optional(),
  links: z.array(httpsLink).max(5).optional(),
  imageMediaId: z.string().optional(),
  evidenceMediaIds: z.array(z.string()).max(5).optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const id = readIdParam(event)
  const { imageMediaId, evidenceMediaIds, ...patch } = await readJsonBody(event, body)
  rejectMediaIds(evidenceMediaIds)
  rejectMediaIds(imageMediaId)
  const t = schema.talentApplication
  const db = useDb()
  const [app] = await db.select().from(t).where(and(eq(t.id, id), eq(t.userId, u.id))).limit(1)
  if (!app) throw apiError('NOT_FOUND', 'Application not found.')
  if (app.status !== 'pending') throw apiError('INVALID_STATE', 'This application has already been decided.')
  if (!Object.keys(patch).length) return applicationView(app)
  const [row] = await db.update(t).set(patch).where(and(eq(t.id, id), eq(t.status, 'pending'))).returning()
  if (!row) throw apiError('INVALID_STATE', 'This application has already been decided.')
  return applicationView(row)
})
