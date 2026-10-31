import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { api, catalog, sql, testEnv, verifiedSession } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

type S = Awaited<ReturnType<typeof verifiedSession>> & { id: string }
async function fan(): Promise<S> {
  const s = await verifiedSession()
  await sql`update "user" set onboarding_status = 'completed' where email = ${s.user.email}`
  const [{ id }] = await sql`select id from "user" where email = ${s.user.email}`
  return { ...s, id: id as string }
}
async function admin() {
  const s = await fan()
  await sql`update "user" set roles = 'fan,super_admin' where email = ${s.user.email}`
  return s
}
async function talentWithCommunity(a: S) {
  const t = await fan()
  const { realityTv } = await catalog()
  const app = await api('/api/talent-applications', { method: 'POST', cookie: t.cookie, body: { categoryId: realityTv.id, displayName: `Star ${Math.random()}`, bio: 'Hi', links: [] } })
  await api(`/api/admin/applications/${app.body.id}/accept`, { method: 'POST', cookie: a.cookie, body: {} })
  const [c] = await sql`select c.id from community c join talent tl on tl.id = c.owner_talent_id where tl.user_id = ${t.id}`
  return { talent: t, communityId: c!.id as string }
}
const inHours = (h: number) => new Date(Date.now() + h * 3600_000).toISOString()
const party = (s: S, body: Record<string, unknown>) => api('/api/watch-parties', { method: 'POST', cookie: s.cookie, body: { title: 'Eviction night', startsAt: inHours(24), timeZone: 'Africa/Lagos', link: 'https://instagram.com/live', ...body } })
const rsvp = (s: S, id: string, method: 'PUT' | 'DELETE') => api(`/api/watch-parties/${id}/rsvp`, { method, cookie: s.cookie })
const runJob = (auth?: string) => api('/api/internal/jobs/notifications', { method: 'POST', body: {}, headers: auth ? { authorization: auth } : {} })

describe('watch parties, RSVPs and notifications (WP-01..08, NOT-01..04, OPS-02)', () => {
  it('talent creates parties; members with alerts are notified; RSVP is idempotent', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const [f1, f2] = [await fan(), await fan()]
    await api(`/api/communities/${communityId}/join`, { method: 'POST', cookie: f1.cookie, body: {} })
    expect((await party(f1, { communityId })).status).toBe(403)
    expect((await party(talent, { communityId, timeZone: 'Mars/Base' })).status).toBe(400)
    expect((await party(talent, { communityId, link: 'http://insecure.example' })).status).toBe(400)
    expect((await party(talent, { communityId, startsAt: inHours(-1) })).status).toBe(400)
    expect((await party(talent, { communityId, endsAt: inHours(23) })).status).toBe(400)
    const p = (await party(talent, { communityId, startsAt: '2030-05-01T19:00:00+01:00' })).body
    expect(p).toMatchObject({ startsAt: '2030-05-01T18:00:00.000Z', timeZone: 'Africa/Lagos', status: 'scheduled', rsvpCount: 0 })
    const [{ n }] = await sql`select count(*)::int as n from notification where user_id = ${f1.id} and type = 'watch_party.created'`
    expect(n).toBe(1)
    const results = await Promise.all([rsvp(f1, p.id, 'PUT'), rsvp(f1, p.id, 'PUT'), rsvp(f2, p.id, 'PUT')])
    expect(results.every(r => r.status === 200 && r.body.going)).toBe(true)
    expect((await api(`/api/watch-parties/${p.id}`, { cookie: f1.cookie })).body).toMatchObject({ rsvpCount: 2, viewerRsvp: true })
    expect((await rsvp(f2, p.id, 'DELETE')).body).toEqual({ going: false, rsvpCount: 1 })
    expect((await rsvp(f2, p.id, 'DELETE')).body).toEqual({ going: false, rsvpCount: 1 })
    expect((await api(`/api/watch-parties/${p.id}`)).body.viewerRsvp).toBe(false)
    expect((await api(`/api/watch-parties/${p.id}`, { method: 'PATCH', cookie: f1.cookie, body: { title: 'x' } })).status).toBe(403)
    expect((await api(`/api/watch-parties/${p.id}`, { method: 'PATCH', cookie: talent.cookie, body: { title: 'Finale night' } })).body.title).toBe('Finale night')
  })

  it('cancel notifies RSVPs once and moves the party to past', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    const p1 = (await party(talent, { communityId, startsAt: inHours(48) })).body
    const p2 = (await party(talent, { communityId, startsAt: inHours(24) })).body
    const page1 = (await api(`/api/watch-parties?communityId=${communityId}&limit=1`)).body
    expect(page1.items.map((i: any) => i.id)).toEqual([p2.id])
    expect((await api(`/api/watch-parties?communityId=${communityId}&limit=1&cursor=${encodeURIComponent(page1.nextCursor)}`)).body.items.map((i: any) => i.id)).toEqual([p1.id])
    await rsvp(f, p1.id, 'PUT')
    const cancel = () => api(`/api/watch-parties/${p1.id}/cancel`, { method: 'POST', cookie: talent.cookie, body: {} })
    expect((await cancel()).body.status).toBe('cancelled')
    expect((await cancel()).status).toBe(200)
    const [{ n }] = await sql`select count(*)::int as n from notification where user_id = ${f.id} and type = 'watch_party.cancelled'`
    expect(n).toBe(1)
    expect((await rsvp(f, p1.id, 'PUT')).body.error.code).toBe('INVALID_STATE')
    expect((await api(`/api/watch-parties/${p1.id}`, { method: 'PATCH', cookie: talent.cookie, body: { title: 'x' } })).status).toBe(409)
    expect((await api(`/api/watch-parties?status=past&communityId=${communityId}`)).body.items.map((i: any) => i.id)).toEqual([p1.id])
  })

  it('the job is secret-protected, sends one reminder, and ends parties', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    const p = (await party(talent, { communityId, startsAt: inHours(24) })).body
    await rsvp(f, p.id, 'PUT')
    expect((await runJob()).status).toBe(404)
    expect((await runJob('Bearer wrong')).status).toBe(404)
    await sql`update watch_party set starts_at = now() + interval '30 minutes' where id = ${p.id}`
    expect((await runJob('Bearer test-cron-secret')).status).toBe(200)
    await runJob('Bearer test-cron-secret')
    const [{ n }] = await sql`select count(*)::int as n from notification where user_id = ${f.id} and type = 'watch_party.reminder'`
    expect(n).toBe(1)
    await sql`update watch_party set starts_at = now() - interval '10 minutes' where id = ${p.id}`
    await runJob('Bearer test-cron-secret')
    expect((await api(`/api/watch-parties/${p.id}`)).body.status).toBe('live')
    await sql`update watch_party set starts_at = now() - interval '4 hours' where id = ${p.id}`
    await runJob('Bearer test-cron-secret')
    expect((await api(`/api/watch-parties/${p.id}`)).body.status).toBe('ended')
  })

  it('notifications: own only, unread count matches, read and read-all are idempotent', async () => {
    const [f, other] = [await fan(), await fan()]
    for (const id of [f.id, f.id, f.id, other.id]) await sql`insert into notification (user_id, type, data) values (${id}, 'badge.awarded', ${sql.json({ badgeId: 'b1' })})`
    expect((await api('/api/notifications/unread-count', { cookie: f.cookie })).body).toEqual({ count: 3 })
    const list = (await api('/api/notifications?limit=2', { cookie: f.cookie })).body
    expect(list.items).toHaveLength(2)
    expect(list.items[0]).toMatchObject({ type: 'badge.awarded', summary: 'You earned a badge', target: { type: 'badge', id: 'b1' }, readAt: null })
    const theirs = (await api('/api/notifications', { cookie: other.cookie })).body.items[0]
    expect((await api(`/api/notifications/${theirs.id}/read`, { method: 'POST', cookie: f.cookie, body: {} })).status).toBe(404)
    const read = (await api(`/api/notifications/${list.items[0].id}/read`, { method: 'POST', cookie: f.cookie, body: {} })).body
    expect(read.readAt).not.toBeNull()
    expect((await api(`/api/notifications/${list.items[0].id}/read`, { method: 'POST', cookie: f.cookie, body: {} })).body.readAt).toBe(read.readAt)
    expect((await api('/api/notifications?unreadOnly=true', { cookie: f.cookie })).body.items).toHaveLength(2)
    expect((await api('/api/notifications/read-all', { method: 'POST', cookie: f.cookie, body: {} })).body).toEqual({ updated: 2 })
    expect((await api('/api/notifications/read-all', { method: 'POST', cookie: f.cookie, body: {} })).body).toEqual({ updated: 0 })
    expect((await api('/api/notifications/unread-count', { cookie: other.cookie })).body).toEqual({ count: 1 })
  })

  it('purge erases accounts past the 30-day grace and anonymises their ledger', async () => {
    const a = await admin()
    const { communityId } = await talentWithCommunity(a)
    const [gone, waiting] = [await fan(), await fan()]
    await api(`/api/communities/${communityId}/join`, { method: 'POST', cookie: gone.cookie, body: {} })
    await api('/api/admin/xp-adjustments', { method: 'POST', cookie: a.cookie, body: { userId: gone.id, amount: 10, reason: 'prize' } })
    await sql`update "user" set status = 'pending_deletion', deletion_requested_at = now() - interval '31 days' where id = ${gone.id}`
    await sql`update "user" set status = 'pending_deletion', deletion_requested_at = now() - interval '10 days' where id = ${waiting.id}`
    expect((await api('/api/internal/jobs/purge', { method: 'POST', body: {} })).status).toBe(404)
    const r = await api('/api/internal/jobs/purge', { method: 'POST', body: {}, headers: { authorization: 'Bearer test-cron-secret' } })
    expect(r.body.purged).toBeGreaterThanOrEqual(1)
    expect(await sql`select id from "user" where id = ${gone.id}`).toHaveLength(0)
    expect(await sql`select id from "user" where id = ${waiting.id}`).toHaveLength(1)
    const [{ n }] = await sql`select count(*)::int as n from xp_transaction where user_id is null and reason = 'prize' and actor_id = ${a.id}`
    expect(n).toBe(1)
    const [c] = await sql`select member_count, originals_assigned from community where id = ${communityId}`
    expect(c).toMatchObject({ member_count: 0, originals_assigned: 1 })
  })
})
