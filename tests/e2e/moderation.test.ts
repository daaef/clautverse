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
const join = (s: S, id: string) => api(`/api/communities/${id}/join`, { method: 'POST', cookie: s.cookie, body: { lane: 'rider' } })
const drop = async (s: S, communityId: string, body = 'hello') =>
  (await api('/api/drops', { method: 'POST', cookie: s.cookie, body: { communityId, type: 'text', body, publishNow: true } })).body
const report = (s: S, body: Record<string, unknown>) => api('/api/reports', { method: 'POST', cookie: s.cookie, body })
const createMission = (s: S, body: Record<string, unknown>) => api('/api/missions', { method: 'POST', cookie: s.cookie, body: { title: 'Vote tonight', xpReward: 50, completionPolicy: { review: 'auto', proof: 'none' }, ...body } })
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

  it('missions are reportable like drops; a missing mission 404s', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    const m = (await createMission(talent, { communityId })).body
    const r = await report(f, { targetType: 'mission', targetId: m.id, reason: 'spam' })
    expect(r.status).toBe(201)
    expect(r.body).toEqual({ id: r.body.id, status: 'open', createdAt: expect.any(String) })
    // remove_content does not apply to a mission report: the not_applicable error shape, report stays open.
    const badAction = await act(a, r.body.id, 'remove_content')
    expect(badAction.status).toBe(400)
    expect(badAction.body.error).toMatchObject({ code: 'VALIDATION_FAILED', details: { fields: { action: 'not_applicable' } } })
    expect((await api('/api/admin/reports?targetType=mission&limit=100', { cookie: a.cookie })).body.items.find((x: any) => x.id === r.body.id).status).toBe('open')
    expect((await report(f, { targetType: 'mission', targetId: '00000000-0000-4000-8000-000000000000', reason: 'spam' })).status).toBe(404)
  })

  it('first removal blocks rejoin for 30 days, second removal is permanent, counts are per-community', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const troll = await fan()
    await join(troll, communityId)
    const d = await drop(talent, communityId)
    const reply = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: troll.cookie, body: { body: 'rude' } })).body
    const r = (await report(talent, { targetType: 'reply', targetId: reply.id, reason: 'harassment' })).body
    expect((await act(a, r.id, 'remove_member')).body.status).toBe('actioned')
    // DEC-03: removal #1 records count 1 and a blockedUntil ≈ now + 30 days.
    const [m1] = await sql`select status, removal_count, blocked_until from membership where user_id = ${troll.id} and community_id = ${communityId}`
    expect(m1).toMatchObject({ status: 'removed', removal_count: 1 })
    const blockedUntil = new Date(m1.blocked_until as string).getTime()
    expect(blockedUntil).toBeGreaterThan(Date.now() + 29 * 86_400_000)
    expect(blockedUntil).toBeLessThan(Date.now() + 31 * 86_400_000)
    // DEC-10: the removed fan gets a membership.removed notification with the community and count.
    const [note] = await sql`select data from notification where user_id = ${troll.id} and type = 'membership.removed'`
    expect(note.data).toMatchObject({ communityId, removalCount: 1 })
    // Rejoin while the window is still running stays blocked.
    const denied = await join(troll, communityId)
    expect(denied.body.error).toMatchObject({ code: 'FORBIDDEN', details: { reason: 'removed', blockedUntil: expect.any(String) } })
    // Once the window has fully elapsed (inclusive boundary), rejoin is allowed again.
    await sql`update membership set blocked_until = now() - interval '1 second' where user_id = ${troll.id} and community_id = ${communityId}`
    expect((await join(troll, communityId)).body.status).toBe('active')
    // Removal #2 for the same (fan, community) pair is a permanent ban.
    const reply2 = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: troll.cookie, body: { body: 'again' } })).body
    const r2 = (await report(talent, { targetType: 'reply', targetId: reply2.id, reason: 'harassment' })).body
    expect((await act(a, r2.id, 'remove_member')).body.status).toBe('actioned')
    const [m2] = await sql`select status, removal_count from membership where user_id = ${troll.id} and community_id = ${communityId}`
    expect(m2).toMatchObject({ status: 'removed', removal_count: 2 })
    expect((await join(troll, communityId)).body.error.details.reason).toBe('removed')
    // The count is scoped to the community: an unrelated community is unaffected.
    const a2 = await admin()
    const comm2 = (await api('/api/admin/communities', { method: 'POST', cookie: a2.cookie, body: { name: `Other ${Date.now()}${Math.random()}` } })).body
    expect((await join(troll, comm2.id)).body.status).toBe('active')
    const [m3] = await sql`select removal_count from membership where user_id = ${troll.id} and community_id = ${comm2.id}`
    expect(m3.removal_count).toBe(0)
  })

  it('reinstating a removed member clears the block but not the removal count', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    const d = await drop(talent, communityId)
    const reply = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: f.cookie, body: { body: 'rude' } })).body
    const r = (await report(talent, { targetType: 'reply', targetId: reply.id, reason: 'harassment' })).body
    await act(a, r.id, 'remove_member')
    // Non-admin cannot reinstate; a missing membership 404s.
    expect((await api(`/api/admin/communities/${communityId}/members/${f.id}/reinstate`, { method: 'POST', cookie: f.cookie, body: { reason: 'appeal' } })).status).toBe(403)
    const nobody = await fan()
    expect((await api(`/api/admin/communities/${communityId}/members/${nobody.id}/reinstate`, { method: 'POST', cookie: a.cookie, body: { reason: 'appeal' } })).status).toBe(404)
    const back = await api(`/api/admin/communities/${communityId}/members/${f.id}/reinstate`, { method: 'POST', cookie: a.cookie, body: { reason: 'appeal accepted' } })
    expect(back.body).toMatchObject({ status: 'active', leftAt: null })
    // Owner ruling: the count stays at 1 even though the block is cleared.
    const [m] = await sql`select status, removal_count, blocked_until from membership where user_id = ${f.id} and community_id = ${communityId}`
    expect(m).toMatchObject({ status: 'active', removal_count: 1, blocked_until: null })
    // A later removal still counts as removal #2 → permanent.
    const reply2 = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: f.cookie, body: { body: 'again' } })).body
    const r2 = (await report(talent, { targetType: 'reply', targetId: reply2.id, reason: 'harassment' })).body
    await act(a, r2.id, 'remove_member')
    const [m2] = await sql`select removal_count from membership where user_id = ${f.id} and community_id = ${communityId}`
    expect(m2.removal_count).toBe(2)
    expect((await join(f, communityId)).body.error.details.reason).toBe('removed')
  })

  it('voluntary leave generates no membership.removed notification', async () => {
    const a = await admin()
    const comm = (await api('/api/admin/communities', { method: 'POST', cookie: a.cookie, body: { name: `Comm ${Date.now()}${Math.random()}` } })).body
    const f = await fan()
    await join(f, comm.id)
    await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })
    const [{ n }] = await sql`select count(*)::int as n from notification where user_id = ${f.id} and type = 'membership.removed'`
    expect(n).toBe(0)
  })

  it('blocking hides the blocked user\'s drops and replies for the blocker only', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    const g = await fan()
    await join(f, communityId)
    await join(g, communityId)
    const d = await drop(talent, communityId, 'public-ish')
    const reply = (await api(`/api/drops/${d.id}/replies`, { method: 'POST', cookie: g.cookie, body: { body: 'hi' } })).body
    // Sanity: f can see the drop and g's reply before blocking.
    expect((await api(`/api/drops/${d.id}`, { cookie: f.cookie })).status).toBe(200)
    expect((await api(`/api/drops/${d.id}/replies`, { cookie: f.cookie })).body.items.map((x: any) => x.id)).toContain(reply.id)
    // Block validation: self-block rejected, nonexistent target 404s, create is idempotent.
    expect((await api(`/api/users/${f.id}/block`, { method: 'POST', cookie: f.cookie })).status).toBe(400)
    expect((await api('/api/users/ghost_user/block', { method: 'POST', cookie: f.cookie })).status).toBe(404)
    const b1 = await api(`/api/users/${g.id}/block`, { method: 'POST', cookie: f.cookie })
    expect(b1.status).toBe(201)
    expect(b1.body).toMatchObject({ id: expect.any(String), createdAt: expect.any(String) })
    const b2 = await api(`/api/users/${g.id}/block`, { method: 'POST', cookie: f.cookie })
    expect(b2.status).toBe(200)
    expect(b2.body.id).toBe(b1.body.id)
    const [{ n }] = await sql`select count(*)::int as n from block where blocker_id = ${f.id}`
    expect(n).toBe(1)
    // Replies from a blocked author are filtered out of the blocker's reply listing only.
    expect((await api(`/api/drops/${d.id}/replies`, { cookie: f.cookie })).status).toBe(200)
    expect((await api(`/api/drops/${d.id}/replies`, { cookie: f.cookie })).body.items.map((x: any) => x.id)).not.toContain(reply.id)
    expect((await api(`/api/drops/${d.id}/replies`, { cookie: g.cookie })).body.items.map((x: any) => x.id)).toContain(reply.id)
    // Unblock is idempotent: deleting a nonexistent block still succeeds, and replies return.
    await api(`/api/users/${g.id}/block`, { method: 'DELETE', cookie: f.cookie })
    expect((await api(`/api/users/${g.id}/block`, { method: 'DELETE', cookie: f.cookie })).status).toBe(200)
    expect((await api(`/api/drops/${d.id}/replies`, { cookie: f.cookie })).body.items.map((x: any) => x.id)).toContain(reply.id)
    // Blocking the talent hides the drop on every surface for f; g is unaffected.
    await api(`/api/users/${talent.id}/block`, { method: 'POST', cookie: f.cookie })
    expect((await api(`/api/drops/${d.id}`, { cookie: f.cookie })).status).toBe(404)
    expect((await api(`/api/communities/${communityId}/drops`, { cookie: f.cookie })).body.items).toEqual([])
    expect((await api('/api/feed', { cookie: f.cookie })).body.items).toEqual([])
    expect((await api(`/api/drops/${d.id}`, { cookie: g.cookie })).status).toBe(200)
    // No notification, no membership or posting side-effects for the blocked user.
    const [{ nn }] = await sql`select count(*)::int as nn from notification where user_id in (${talent.id}, ${g.id}) and type like 'block%'`
    expect(nn).toBe(0)
    const [gm] = await sql`select status from membership where user_id = ${g.id} and community_id = ${communityId}`
    expect(gm.status).toBe('active')
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
