import { eq } from 'drizzle-orm'
import { z } from 'zod'

// DROP-01: community owner (talent) or admin. Voice/image need uploads (R2) — not yet available.
const body = z.object({
  communityId: z.uuid(),
  type: z.enum(['text', 'voice', 'image']),
  body: z.string().trim().min(1).max(5000).optional(),
  mediaIds: z.array(z.string()).max(10).optional(),
  audience: z.enum(['public', 'members', 'originals_only']).default('members'),
  teaser: z.string().trim().min(1).max(100).optional(),
  publishAt: z.iso.datetime({ offset: true }).optional(),
  publishNow: z.boolean().optional(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const key = idempotencyHeader(event)
  const input = await readJsonBody(event, body)
  const replay = await findIdempotent(u.id, 'drop.create', key)
  if (replay) {
    setResponseStatus(event, 201)
    const r = await loadDrop(replay, u)
    return dropView(r.drop, r.talent, true)
  }
  if (input.type !== 'text') throw apiError('FEATURE_DISABLED', 'Voice and image drops arrive with uploads. Post a text drop for now.')
  rejectMediaIds(input.mediaIds)
  if (!input.body) throw apiError('VALIDATION_FAILED', 'Text drops need a body.', { fields: { body: 'required' } })
  const publishAt = input.publishAt ? new Date(input.publishAt) : null
  if (publishAt && publishAt <= new Date()) throw apiError('VALIDATION_FAILED', 'publishAt must be in the future.', { fields: { publishAt: 'past' } })
  if (publishAt && input.publishNow) throw apiError('VALIDATION_FAILED', 'Use publishAt or publishNow, not both.', { fields: { publishAt: 'conflict' } })
  const comm = await loadVisibleCommunity(input.communityId, u)
  if (!isAdmin(u) && !(await isCommunityOwner(comm, u.id))) throw apiError('FORBIDDEN', 'Only the community\'s talent can post drops.')
  const status = input.publishNow ? 'published' : publishAt ? 'scheduled' : 'draft'
  const created = await useDb().transaction(async (tx) => {
    const [row] = await tx.insert(schema.drop).values({
      communityId: comm.id, authorId: u.id, type: input.type, body: input.body, teaser: input.teaser ?? null,
      audience: input.audience, status, publishAt: input.publishNow ? new Date() : publishAt,
    }).returning()
    await saveIdempotent(tx, u.id, 'drop.create', key, row!.id)
    if (status === 'published') await notifyDropPublished(tx, row!)
    return row!
  })
  const [tal] = comm.ownerTalentId ? await useDb().select().from(schema.talent).where(eq(schema.talent.id, comm.ownerTalentId)).limit(1) : []
  setResponseStatus(event, 201)
  return dropView(created, tal ?? null, true)
})
