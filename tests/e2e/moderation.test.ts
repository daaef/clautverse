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
const join = (s: S, id: string) => api(`/api/communities/${id}/join`, { method: 'POST', cookie: s.cookie, body: {} })
const drop = async (s: S, communityId: string, body = 'hello') =>
  (await api('/api/drops', { method: 'POST', cookie: s.cookie, body: { communityId, type: 'text', body, publishNow: true } })).body
const report = (s: S, body: Record<string, unknown>) => api('/api/reports', { method: 'POST', cookie: s.cookie, body })
const act = (a: S, id: string, action: string) => api(`/api/admin/reports/${id}/actions`, { method: 'POST', cookie: a.cookie, body: { action } })

describe('reports and moderation (RPT-01, ADM-10..13)', () => {
  it('reports are deduplicated, anonymous and queued FIFO; remove_content hides the drop', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    const d = await drop(talent, communityId, 'spammy')
    expect((await report(f, { targetType: 'drop', targetId: '00000000-0000-4000-8000-000000000000', reason: 'spam' })).status).toBe(404)
    const first = await report(f, { targetType: 'drop', targetId: d.id, reason: 'spam', details: 'buy followers' })
    expect(first.status).toBe(201)
    expect(first.body).toEqual({ id: first.body.id, status: 'open', createdAt: expect.any(String) })
    const again = await report(f, { targetType: 'drop', targetId: d.id, reason: 'spam' })
    expect(again.status).toBe(200)
    expect(again.body.id).toBe(first.body.id)
    const [{ n }] = await sql`select count(*)::int as n from notification where user_id = ${talent.id} and type like 'report%'`
    expect(n).toBe(0)
    expect((await api('/api/admin/reports', { cookie: f.cookie })).status).toBe(403)
    const queue = (await api('/api/admin/reports?targetType=drop&limit=100', { cookie: a.cookie })).body.items
    expect(queue.find((r: any) => r.id === first.body.id)).toMatchObject({ reporterId: f.id, details: 'buy followers' })
    expect((await act(a, first.body.id, 'remove_content')).body).toMatchObject({ status: 'actioned', action: 'remove_content' })
    expect((await api('/api/feed', { cookie: f.cookie })).body.items).toEqual([])
    expect((await act(a, first.body.id, 'dismiss')).body.error.code).toBe('INVALID_STATE')
    const second = await report(f, { targetType: 'community', targetId: communityId, reason: 'other' })
    expect((await act(a, second.body.id, 'dismiss')).body.status).toBe('dismissed')
    const [{ audits }] = await sql`select count(*)::int as audits from admin_audit where target_id in (${first.body.id}, ${second.body.id}, ${d.id})`
    expect(audits).toBe(3)
  })

  it('remove_member retires the Originals number; veto_community hides it', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const troll = await fan()
    expect((await join(troll, communityId)).body.originalPosition).toBe(1)
    const d = await drop(talent, communityId)
    const reply = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: troll.cookie, body: { body: 'rude' } })).body
    const r = (await report(talent, { targetType: 'reply', targetId: reply.id, reason: 'harassment' })).body
    expect((await act(a, r.id, 'veto_community')).status).toBe(200)
    await api(`/api/admin/communities/${communityId}/restore`, { method: 'POST', cookie: a.cookie, body: {} })
    const r2 = (await report(talent, { targetType: 'reply', targetId: reply.id, reason: 'harassment' })).body
    expect((await act(a, r2.id, 'remove_member')).body.status).toBe('actioned')
    expect((await join(troll, communityId)).body.error.details.reason).toBe('removed')
    const next = await fan()
    expect((await join(next, communityId)).body.originalPosition).toBe(2)
    const r3 = (await report(talent, { targetType: 'community', targetId: communityId, reason: 'other' })).body
    expect((await act(a, r3.id, 'remove_member')).body.error.code).toBe('VALIDATION_FAILED')
  })

  it('admins search, suspend and reinstate users; suspension logs the user out', async () => {
    const a = await admin()
    const other = await admin()
    const f = await fan()
    const found = (await api(`/api/admin/users?q=${encodeURIComponent(f.user.email)}`, { cookie: a.cookie })).body.items
    expect(found.map((u: any) => u.id)).toEqual([f.id])
    expect((await api('/api/admin/users?role=super_admin&limit=100', { cookie: a.cookie })).body.items.every((u: any) => u.roles.includes('super_admin'))).toBe(true)
    expect((await api(`/api/admin/users/${a.id}/suspend`, { method: 'POST', cookie: a.cookie, body: { reason: 'x' } })).status).toBe(403)
    expect((await api(`/api/admin/users/${other.id}/suspend`, { method: 'POST', cookie: a.cookie, body: { reason: 'x' } })).status).toBe(403)
    expect((await api(`/api/admin/users/${f.id}/suspend`, { method: 'POST', cookie: a.cookie, body: {} })).status).toBe(400)
    const s = await api(`/api/admin/users/${f.id}/suspend`, { method: 'POST', cookie: a.cookie, body: { reason: 'spam', internalNote: 'bot' } })
    expect(s.body.status).toBe('suspended')
    expect((await api('/api/me', { cookie: f.cookie })).status).toBe(401)
    const back = await api(`/api/admin/users/${f.id}/reinstate`, { method: 'POST', cookie: a.cookie, body: { reason: 'appeal accepted' } })
    expect(back.body.status).toBe('active')
    const actions = (await sql`select action from admin_audit where target_id = ${f.id} order by created_at`).map(r => r.action)
    expect(actions).toEqual(['user.suspended', 'user.reinstated'])
    const g = await fan()
    const reporter = await fan()
    const r = (await report(reporter, { targetType: 'user', targetId: g.id, reason: 'impersonation' })).body
    expect((await act(a, r.id, 'suspend_user')).body.status).toBe('actioned')
    const [{ status }] = await sql`select status from "user" where id = ${g.id}`
    expect(status).toBe('suspended')
  })
})
