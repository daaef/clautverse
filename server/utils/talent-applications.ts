import { z } from 'zod'

type App = typeof schema.talentApplication.$inferSelect
type Claim = typeof schema.identityClaim.$inferSelect

export const httpsLink = z.object({ label: z.string().trim().min(1).max(40), url: z.url({ protocol: /^https$/ }).max(500) })

/** Uploads (R2) aren't wired yet; media IDs are rejected until they are. */
export function rejectMediaIds(ids: unknown) {
  if (Array.isArray(ids) ? ids.length : ids) throw apiError('FEATURE_DISABLED', 'File uploads are not available yet. Use links instead.')
}

export const REAPPLY_DAYS = 7

// Applicant view: never includes internalNote or decidedBy.
export const applicationView = (a: App) => ({
  id: a.id, status: a.status, categoryId: a.categoryId, displayName: a.displayName, bio: a.bio, links: a.links, imageUrl: null,
  submittedAt: a.submittedAt.toISOString(), decidedAt: a.decidedAt?.toISOString() ?? null, decisionReason: a.decisionReason,
  reapplyAfter: a.status === 'declined' && a.decidedAt ? new Date(a.decidedAt.getTime() + REAPPLY_DAYS * 86400_000).toISOString() : null,
})
export const adminApplicationView = (a: App) => ({ ...applicationView(a), internalNote: a.internalNote, talentId: a.talentId, decidedBy: a.decidedBy })

export const claimView = (c: Claim) => ({
  id: c.id, talentId: c.talentId, status: c.status, submittedAt: c.submittedAt.toISOString(),
  decidedAt: c.decidedAt?.toISOString() ?? null, decisionReason: c.decisionReason,
})
export const adminClaimView = (c: Claim) => ({ ...claimView(c), evidenceLinks: c.evidenceLinks, message: c.message, internalNote: c.internalNote, decidedBy: c.decidedBy })

export const decisionBody = z.object({ internalNote: z.string().trim().max(2000).optional(), decisionReason: z.string().trim().min(1).max(1000).optional() }).strict()
