import { getXpRules } from '../../utils/missions'
import { z } from 'zod'

// MIS-03: community owner or admin; xpReward within admin range (ADM-15).
const body = z.object({
  communityId: z.uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(''),
  xpReward: z.number().int(),
  deadline: z.iso.datetime({ offset: true }).optional(),
  completionPolicy: z.object({ review: z.enum(['auto', 'owner']), proof: z.enum(['none', 'link', 'text']) }).strict(),
}).strict()

export default defineEventHandler(async (event) => {
  const u = await requireUser(event)
  const key = idempotencyHeader(event)
  const input = await readJsonBody(event, body)
  const replay = await findIdempotent(u.id, 'mission.create', key)
  if (replay) {
    const r = await loadMission(replay, u)
    setResponseStatus(event, 201)
    return missionView(r.mission, r.creator)
  }
  const comm = await loadVisibleCommunity(input.communityId, u)
  if (!isAdmin(u) && !(await isCommunityOwner(comm, u.id))) throw apiError('FORBIDDEN', 'Only the community\'s talent can create missions.')
  const rules = await getXpRules()
  if (input.xpReward < rules.missionXpMin || input.xpReward > rules.missionXpMax)
    throw apiError('VALIDATION_FAILED', `XP reward must be between ${rules.missionXpMin} and ${rules.missionXpMax}.`, { fields: { xpReward: 'out_of_range' } })
  const deadline = input.deadline ? new Date(input.deadline) : null
  if (deadline && deadline <= new Date()) throw apiError('VALIDATION_FAILED', 'Deadline must be in the future.', { fields: { deadline: 'past' } })
  if (input.completionPolicy.review === 'owner' && input.completionPolicy.proof === 'none')
    throw apiError('VALIDATION_FAILED', 'Reviewed missions need proof (link or text).', { fields: { completionPolicy: 'proof_required' } })
  const m = await useDb().transaction(async (tx) => {
    const [row] = await tx.insert(schema.mission).values({
      communityId: comm.id, creatorId: u.id, title: input.title, description: input.description, xpReward: input.xpReward,
      deadline, status: 'approved', review: input.completionPolicy.review, proof: input.completionPolicy.proof,
    }).returning()
    await saveIdempotent(tx, u.id, 'mission.create', key, row!.id)
    return row!
  })
  setResponseStatus(event, 201)
  return missionView(m, u)
})
