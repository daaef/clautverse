import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { api, catalog, sql, testEnv, verifiedSession } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

type S = Awaited<ReturnType<typeof verifiedSession>>
async function fan() {
  const s = await verifiedSession()
  await sql`update "user" set onboarding_status = 'completed' where email = ${s.user.email}`
  return s
}
async function admin() {
  const s = await fan()
  await sql`update "user" set roles = 'fan,super_admin' where email = ${s.user.email}`
  return s
}
/** A talent with an auto-created community, via the real application → accept flow. */
async function talentWithCommunity(a: S) {
  const t = await fan()
  const { realityTv } = await catalog()
  const app = await api('/api/talent-applications', { method: 'POST', cookie: t.cookie, body: { categoryId: realityTv.id, displayName: `Star ${Math.random()}`, bio: 'Hi', links: [] } })
  expect(app.status).toBe(201)
  expect((await api(`/api/admin/applications/${app.body.id}/accept`, { method: 'POST', cookie: a.cookie, body: {} })).status).toBe(200)
  const [c] = await sql`select c.id from community c join talent tl on tl.id = c.owner_talent_id join "user" u on u.id = tl.user_id where u.email = ${t.user.email}`
  return { talent: t, communityId: c!.id as string }
}
const join = (s: S, id: string) => api(`/api/communities/${id}/join`, { method: 'POST', cookie: s.cookie, body: {} })
const post = (s: S, body: Record<string, unknown>, headers?: Record<string, string>) => api('/api/drops', { method: 'POST', cookie: s.cookie, body, headers })

describe('drops, feed, likes and replies (FEED-01..02, DROP-01..10)', () => {
  it('only the community talent posts; text-only for now; idempotency key replays', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    expect((await post(f, { communityId, type: 'text', body: 'x', publishNow: true })).status).toBe(403)
    expect((await post(talent, { communityId, type: 'voice', publishNow: true })).body.error.code).toBe('FEATURE_DISABLED')
    expect((await post(talent, { communityId, type: 'text', publishNow: true })).body.error.code).toBe('VALIDATION_FAILED')
    expect((await post(talent, { communityId, type: 'text', body: 'x', publishAt: '2020-01-01T00:00:00Z' })).status).toBe(400)
    const key = { 'idempotency-key': `k-${Math.random()}` }
    const first = await post(talent, { communityId, type: 'text', body: 'Hello fans', publishNow: true }, key)
    expect(first.status).toBe(201)
    expect(first.body).toMatchObject({ status: 'published', audience: 'members', locked: false, body: 'Hello fans' })
    const replay = await post(talent, { communityId, type: 'text', body: 'Hello fans', publishNow: true }, key)
    expect(replay.status).toBe(201)
    expect(replay.body.id).toBe(first.body.id)
    const [{ n }] = await sql`select count(*)::int as n from drop where community_id = ${communityId}`
    expect(n).toBe(1)
    const [{ alerts }] = await sql`select count(*)::int as alerts from notification n join "user" u on u.id = n.user_id where u.email = ${f.user.email} and n.type = 'drop.published'`
    expect(alerts).toBe(1)
  })

  it('locked cards never leak body; Originals-only drops lock for later members', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const original = await fan()
    await join(original, communityId)
    await sql`update community set originals_assigned = 100 where id = ${communityId}`
    const late = await fan()
    expect((await join(late, communityId)).body.originalPosition).toBeNull()
    const members = await post(talent, { communityId, type: 'text', body: 'secret', teaser: 'eviction night 👀', publishNow: true })
    const pub = await post(talent, { communityId, type: 'text', body: 'for everyone', audience: 'public', publishNow: true })
    const og = await post(talent, { communityId, type: 'text', body: 'og only', audience: 'originals_only', teaser: 'OGs', publishNow: true })
    const anon = await api(`/api/communities/${communityId}/drops`)
    const byId = (items: any[]) => Object.fromEntries(items.map(i => [i.id, i]))
    const out = byId(anon.body.items)
    expect(out[members.body.id]).toMatchObject({ locked: true, body: null, media: null, teaser: 'eviction night 👀', type: 'text' })
    expect(out[members.body.id].talent.name).toBeTruthy()
    expect(out[pub.body.id]).toMatchObject({ locked: false, body: 'for everyone' })
    expect(JSON.stringify(anon.body)).not.toContain('secret')
    expect(JSON.stringify(anon.body)).not.toContain('og only')
    const lateFeed = byId((await api('/api/feed', { cookie: late.cookie })).body.items)
    expect(lateFeed[members.body.id].body).toBe('secret')
    expect(lateFeed[og.body.id]).toMatchObject({ locked: true, body: null, teaser: 'OGs' })
    expect((await api(`/api/drops/${og.body.id}`, { cookie: original.cookie })).body.body).toBe('og only')
    expect((await api(`/api/drops/${og.body.id}/replies`, { cookie: late.cookie })).status).toBe(403)
  })

  it('drafts and future-scheduled drops stay hidden until due; published drops lock audience', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    const draft = await post(talent, { communityId, type: 'text', body: 'draft' })
    expect(draft.body.status).toBe('draft')
    expect((await api(`/api/drops/${draft.body.id}`, { cookie: f.cookie })).status).toBe(404)
    const later = await post(talent, { communityId, type: 'text', body: 'later', publishAt: new Date(Date.now() + 3600_000).toISOString() })
    expect(later.body.status).toBe('scheduled')
    const ids = async () => (await api('/api/feed', { cookie: f.cookie })).body.items.map((i: any) => i.id)
    expect(await ids()).toEqual([])
    await sql`update drop set publish_at = now() - interval '1 second' where id = ${later.body.id}`
    expect(await ids()).toEqual([later.body.id])
    const pub = await api(`/api/drops/${draft.body.id}/publish`, { method: 'POST', cookie: talent.cookie, body: {} })
    expect(pub.body.status).toBe('published')
    expect((await api(`/api/drops/${draft.body.id}/publish`, { method: 'POST', cookie: talent.cookie, body: {} })).status).toBe(200)
    expect((await api(`/api/drops/${draft.body.id}`, { method: 'PATCH', cookie: talent.cookie, body: { audience: 'public' } })).body.error.code).toBe('INVALID_STATE')
    expect((await api(`/api/drops/${draft.body.id}`, { method: 'PATCH', cookie: f.cookie, body: { body: 'hijack' } })).status).toBe(403)
    const edited = await api(`/api/drops/${draft.body.id}`, { method: 'PATCH', cookie: talent.cookie, body: { body: 'fixed typo' } })
    expect(edited.body.body).toBe('fixed typo')
    expect(edited.body.editedAt).not.toBeNull()
    expect((await api(`/api/drops/${draft.body.id}`, { method: 'DELETE', cookie: a.cookie })).status).toBe(204)
    expect((await api(`/api/drops/${draft.body.id}`, { method: 'DELETE', cookie: a.cookie })).status).toBe(204)
    expect((await api(`/api/drops/${draft.body.id}`, { cookie: f.cookie })).status).toBe(404)
    const [row] = await sql`select count(*)::int as n from admin_audit where action = 'drop.removed' and target_id = ${draft.body.id}`
    expect(row!.n).toBe(1)
    expect((await api(`/api/drops/${draft.body.id}`, { method: 'PATCH', cookie: talent.cookie, body: { body: 'x' } })).status).toBe(404)
  })

  it('feed pages have no duplicates while new drops arrive; non-member communityId is 403', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    for (let i = 0; i < 5; i++) await post(talent, { communityId, type: 'text', body: `d${i}`, publishNow: true })
    const seen: string[] = []
    let cursor: string | null = null
    do {
      const page: any = await api(`/api/feed?limit=2${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`, { cookie: f.cookie })
      seen.push(...page.body.items.map((i: any) => i.id))
      cursor = page.body.nextCursor
      await post(talent, { communityId, type: 'text', body: 'new arrival', publishNow: true })
    } while (cursor)
    expect(seen).toHaveLength(5)
    expect(new Set(seen).size).toBe(5)
    const other = await talentWithCommunity(a)
    const denied = await api(`/api/feed?communityId=${other.communityId}`, { cookie: f.cookie })
    expect(denied.status).toBe(403)
    expect(denied.body.error.details.reason).toBe('not_member')
    await api(`/api/communities/${communityId}/leave`, { method: 'POST', cookie: f.cookie })
    expect((await api('/api/feed', { cookie: f.cookie })).body.items).toEqual([])
  })

  it('likes are one per fan; replies are members-only, one level deep, and moderatable', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const m1 = await fan()
    const m2 = await fan()
    const outsider = await fan()
    await join(m1, communityId)
    await join(m2, communityId)
    const d = (await post(talent, { communityId, type: 'text', body: 'public post', audience: 'public', publishNow: true })).body
    const locked = (await post(talent, { communityId, type: 'text', body: 'members post', publishNow: true })).body
    const like = (s: S, id: string, method = 'PUT') => api(`/api/drops/${id}/reactions/me`, { method, cookie: s.cookie })
    expect((await like(m1, d.id)).body.reactionCounts.like).toBe(1)
    expect((await like(m1, d.id)).body.reactionCounts.like).toBe(1)
    expect((await like(m2, d.id)).body.reactionCounts.like).toBe(2)
    expect((await like(m2, d.id, 'DELETE')).status).toBe(204)
    expect((await like(m2, d.id, 'DELETE')).status).toBe(204)
    expect((await api(`/api/drops/${d.id}`, { cookie: m1.cookie })).body).toMatchObject({ reactionCounts: { like: 1 }, viewerReaction: 'like' })
    expect((await like(outsider, locked.id)).body.error.details.reason).toBe('locked')

    const reply = (s: S, body: Record<string, unknown>) => api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: s.cookie, body })
    expect((await reply(outsider, { body: 'hi' })).status).toBe(403)
    expect((await reply(m1, { body: '   ' })).status).toBe(400)
    const top = await reply(m1, { body: 'first!' })
    expect(top.status).toBe(201)
    const child = await reply(m2, { body: 'second', parentReplyId: top.body.id })
    expect(child.status).toBe(201)
    expect((await reply(m1, { body: 'third', parentReplyId: child.body.id })).status).toBe(400)
    const [{ n }] = await sql`select count(*)::int as n from notification nt join "user" u on u.id = nt.user_id where u.email = ${m1.user.email} and nt.type = 'reply.replied'`
    expect(n).toBe(1)
    expect((await api(`/api/replies/${top.body.id}`, { method: 'DELETE', cookie: m2.cookie })).status).toBe(403)
    expect((await api(`/api/replies/${top.body.id}`, { method: 'DELETE', cookie: talent.cookie })).status).toBe(204)
    const list = (await api(`/api/drops/${d.id}/replies`)).body.items
    expect(list.map((r: any) => [r.status, r.body])).toEqual([['removed', null], ['active', 'second']])
    expect(JSON.stringify(list)).not.toContain('@example.com')
    expect((await api(`/api/drops/${d.id}`)).body.replyCount).toBe(1)
  })
})
