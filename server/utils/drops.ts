import type { H3Event } from 'h3'
import { and, eq, inArray, lte, sql } from 'drizzle-orm'

type Drop = typeof schema.drop.$inferSelect
type Membership = typeof schema.membership.$inferSelect
type TalentLite = { id: string, name: string, imageUrl: string | null, userId: string | null } | null

export const isLive = (d: Drop, now = new Date()) => (d.status === 'published' || d.status === 'scheduled') && !!d.publishAt && d.publishAt <= now
export const effectiveStatus = (d: Drop) => (isLive(d) ? 'published' : d.status)
export const liveFilter = () => and(inArray(schema.drop.status, ['published', 'scheduled']), lte(schema.drop.publishAt, sql`now()`))

/** Decisions 7–8: who may see a drop's body. Staff = community owner or admin. */
export function canSeeDrop(d: Drop, isStaff: boolean, m: Membership | null | undefined) {
  if (isStaff || d.audience === 'public') return true
  if (!m || m.status !== 'active') return false
  return d.audience === 'members' || m.originalPosition !== null
}

/** Locked cards carry talent, type, time and teaser only — never body or media. */
export const dropView = (d: Drop, talent: TalentLite, canSee: boolean, liked = false) => ({
  id: d.id, communityId: d.communityId, type: d.type, audience: d.audience, status: effectiveStatus(d),
  talent: talent ? { id: talent.id, name: talent.name, imageUrl: talent.imageUrl } : null,
  teaser: d.teaser, locked: !canSee, body: canSee ? d.body : null, media: null,
  publishedAt: d.publishAt?.toISOString() ?? null, createdAt: d.createdAt.toISOString(), editedAt: d.editedAt?.toISOString() ?? null,
  reactionCounts: { like: d.likeCount }, replyCount: d.replyCount, viewerReaction: canSee && liked ? 'like' : null,
})

export async function loadDrop(id: string, viewer: DbUser | null, tx: DbOrTx = useDb(), lock = false) {
  const q = tx.select({ drop: schema.drop, community: schema.community, talent: schema.talent }).from(schema.drop)
    .innerJoin(schema.community, eq(schema.community.id, schema.drop.communityId))
    .leftJoin(schema.talent, eq(schema.talent.id, schema.community.ownerTalentId))
    .where(eq(schema.drop.id, id)).limit(1)
  const [r] = lock ? await q.for('update', { of: schema.drop }) : await q
  const admin = isAdmin(viewer)
  if (!r || (r.community.status === 'vetoed' && !admin)) throw apiError('NOT_FOUND', 'Drop not found.')
  const isAuthor = !!viewer && r.drop.authorId === viewer.id
  const isStaff = admin || (!!viewer && r.talent?.userId === viewer.id)
  const gone = r.drop.status === 'archived' || r.drop.status === 'removed'
  if ((gone && !admin) || (!isLive(r.drop) && !isStaff && !isAuthor)) throw apiError('NOT_FOUND', 'Drop not found.')
  const membership = viewer
    ? (await tx.select().from(schema.membership).where(and(eq(schema.membership.userId, viewer.id), eq(schema.membership.communityId, r.community.id))).limit(1))[0] ?? null
    : null
  return { ...r, isAuthor, isStaff, membership, canSee: canSeeDrop(r.drop, isStaff, membership) }
}

/** Shapes a page of drop rows for a viewer (batch-loads memberships and likes). */
export async function dropListViews(rows: { drop: Drop, talent: TalentLite }[], viewer: DbUser | null) {
  const mine = await viewerMemberships(viewer?.id, [...new Set(rows.map(r => r.drop.communityId))])
  const liked = viewer && rows.length
    ? new Set((await useDb().select({ id: schema.dropReaction.dropId }).from(schema.dropReaction)
        .where(and(eq(schema.dropReaction.userId, viewer.id), inArray(schema.dropReaction.dropId, rows.map(r => r.drop.id))))).map(r => r.id))
    : new Set<string>()
  const admin = isAdmin(viewer)
  return (r: { drop: Drop, talent: TalentLite }) => {
    const staff = admin || (!!viewer && r.talent?.userId === viewer.id)
    return dropView(r.drop, r.talent, canSeeDrop(r.drop, staff, mine.get(r.drop.communityId)), liked.has(r.drop.id))
  }
}

/** Decision 13: in-app alert to active members with alerts on (author excluded). */
export async function notifyDropPublished(tx: DbOrTx, d: Drop) {
  await tx.execute(sql`
    insert into notification (user_id, type, data)
    select m.user_id, 'drop.published', jsonb_build_object('dropId', ${d.id}::text, 'communityId', ${d.communityId}::text)
    from membership m
    where m.community_id = ${d.communityId} and m.status = 'active' and m.alerts_enabled and m.user_id is distinct from ${d.authorId}`)
}

export const idempotencyHeader = (event: H3Event) => {
  const k = getRequestHeader(event, 'idempotency-key')?.trim()
  if (k && k.length > 200) throw apiError('VALIDATION_FAILED', 'Idempotency-Key is too long.')
  return k || null
}

export async function findIdempotent(userId: string, scope: string, key: string | null) {
  if (!key) return null
  const [r] = await useDb().select({ id: schema.idempotencyKey.resourceId }).from(schema.idempotencyKey)
    .where(and(eq(schema.idempotencyKey.userId, userId), eq(schema.idempotencyKey.scope, scope), eq(schema.idempotencyKey.key, key))).limit(1)
  return r?.id ?? null
}

export async function saveIdempotent(tx: DbOrTx, userId: string, scope: string, key: string | null, resourceId: string) {
  if (key) await tx.insert(schema.idempotencyKey).values({ userId, scope, key, resourceId })
}

export const replyView = (r: typeof schema.reply.$inferSelect, author: Parameters<typeof publicUser>[0] | null) => {
  const hidden = r.status !== 'active'
  return {
    id: r.id, dropId: r.dropId, parentReplyId: r.parentReplyId, status: r.status,
    author: hidden || !author ? null : publicUser(author), body: hidden ? null : r.body,
    createdAt: r.createdAt.toISOString(), editedAt: r.editedAt?.toISOString() ?? null,
  }
}
