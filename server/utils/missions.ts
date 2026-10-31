import { and, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'

type Mission = typeof schema.mission.$inferSelect
type Completion = typeof schema.missionCompletion.$inferSelect
type UserLite = Parameters<typeof publicUser>[0]

export const DEFAULT_XP_RULES = { missionXpMin: 5, missionXpMax: 100 }

export const getXpRules = async (tx: DbOrTx = useDb()) => {
  const [r] = await tx.select().from(schema.appSetting).where(eq(schema.appSetting.key, 'xp_rules')).limit(1)
  return { ...DEFAULT_XP_RULES, ...(r?.value as Partial<typeof DEFAULT_XP_RULES> | undefined) }
}

/** The only way XP changes. A repeated (user, source) grant returns the original row. */
export async function grantXp(tx: DbOrTx, v: { userId: string, amount: number, sourceType: 'mission_completion' | 'admin_adjustment', sourceId: string, actorId?: string | null, reason?: string | null }) {
  const x = schema.xpTransaction
  const [row] = await tx.insert(x).values({ ...v, actorId: v.actorId ?? null, reason: v.reason ?? null }).onConflictDoNothing().returning()
  if (row) return row
  const [existing] = await tx.select().from(x).where(and(eq(x.userId, v.userId), eq(x.sourceType, v.sourceType), eq(x.sourceId, v.sourceId))).limit(1)
  return existing!
}

export const isExpired = (m: Mission) => m.status === 'approved' && !!m.deadline && m.deadline <= new Date()
export const missionStatus = (m: Mission) => (isExpired(m) ? 'expired' : m.status)

export const completionView = (c: Completion) => ({
  id: c.id, missionId: c.missionId, userId: c.userId, status: c.status,
  proof: c.proofLink || c.proofText ? { ...(c.proofLink ? { link: c.proofLink } : {}), ...(c.proofText ? { text: c.proofText } : {}) } : null,
  rejectionReason: c.rejectionReason, xpTransactionId: c.xpTransactionId,
  createdAt: c.createdAt.toISOString(), reviewedAt: c.reviewedAt?.toISOString() ?? null,
})

export const missionView = (m: Mission, creator: UserLite | null, viewerCompletion: Completion | null = null) => ({
  id: m.id, communityId: m.communityId, creator: creator ? publicUser(creator) : null, title: m.title, description: m.description,
  xpReward: m.xpReward, deadline: m.deadline?.toISOString() ?? null, status: missionStatus(m),
  completionPolicy: { review: m.review, proof: m.proof }, createdAt: m.createdAt.toISOString(),
  viewerCompletion: viewerCompletion ? completionView(viewerCompletion) : null,
})

export async function viewerCompletions(userId: string | undefined, missionIds: string[]) {
  if (!userId || !missionIds.length) return new Map<string, Completion>()
  const rows = await useDb().select().from(schema.missionCompletion)
    .where(and(eq(schema.missionCompletion.userId, userId), inArray(schema.missionCompletion.missionId, missionIds)))
  return new Map(rows.map(r => [r.missionId, r]))
}

/** Pending/rejected missions are visible only to staff (owner/admin) and their creator. */
export async function loadMission(id: string, viewer: DbUser | null, tx: DbOrTx = useDb()) {
  const [r] = await tx.select({ mission: schema.mission, community: schema.community, talent: schema.talent, creator: schema.user }).from(schema.mission)
    .innerJoin(schema.community, eq(schema.community.id, schema.mission.communityId))
    .leftJoin(schema.talent, eq(schema.talent.id, schema.community.ownerTalentId))
    .leftJoin(schema.user, eq(schema.user.id, schema.mission.creatorId))
    .where(eq(schema.mission.id, id)).limit(1)
  const admin = isAdmin(viewer)
  if (!r || (r.community.status === 'vetoed' && !admin)) throw apiError('NOT_FOUND', 'Mission not found.')
  const isStaff = admin || (!!viewer && r.talent?.userId === viewer.id)
  if (r.mission.status !== 'approved' && r.mission.status !== 'closed' && !isStaff && r.mission.creatorId !== viewer?.id) throw apiError('NOT_FOUND', 'Mission not found.')
  return { ...r, isStaff }
}

/** Loads a completion with its mission; only the mission's staff may review. */
export async function loadCompletionForReview(tx: DbOrTx, id: string, viewer: DbUser) {
  const [c] = await tx.select().from(schema.missionCompletion).where(eq(schema.missionCompletion.id, id)).for('update').limit(1)
  if (!c) throw apiError('NOT_FOUND', 'Completion not found.')
  const r = await loadMission(c.missionId, viewer, tx)
  if (!r.isStaff) throw apiError('FORBIDDEN', 'Only the community\'s talent can review completions.')
  return { completion: c, ...r }
}

export const xpView = (x: typeof schema.xpTransaction.$inferSelect) => ({
  id: x.id, amount: x.amount, sourceType: x.sourceType, sourceId: x.sourceId, actorId: x.actorId, reason: x.reason, createdAt: x.createdAt.toISOString(),
})

export const badgeView = (b: typeof schema.badge.$inferSelect) => ({
  id: b.id, name: b.name, description: b.description, iconUrl: b.iconUrl, communityId: b.communityId, sortOrder: b.sortOrder, active: b.active,
})

export const badgePatch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  description: z.string().trim().max(300).optional(),
  iconUrl: z.url({ protocol: /^https$/ }).max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
  active: z.boolean().optional(),
}).strict()
export const badgeBody = badgePatch.extend({ name: z.string().trim().min(1).max(60), communityId: z.uuid().optional() }).omit({ active: true })
