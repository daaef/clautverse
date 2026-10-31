import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { api, sql, testEnv, verifiedSession } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

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
async function fans(n: number) {
  const out = []
  for (let i = 0; i < n; i += 10) out.push(...await Promise.all(Array.from({ length: Math.min(10, n - i) }, fan)))
  return out
}
async function newCommunity(a: { cookie: string }, extra: Record<string, unknown> = {}) {
  const res = await api('/api/admin/communities', { method: 'POST', cookie: a.cookie, body: { name: `Comm ${Date.now()}${Math.random()}`, ...extra } })
  expect(res.status).toBe(201)
  return res.body
}

describe('communities and memberships (COM-01..08, ADM-08..09a)', () => {
  it('join is idempotent, requires onboarding, and leave/rejoin keeps the Originals number', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const notOnboarded = await verifiedSession()
    expect((await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: notOnboarded.cookie, body: {} })).body.error.code).toBe('ONBOARDING_REQUIRED')
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    expect(first.status).toBe(201)
    expect(first.body.originalPosition).toBe(1)
    const again = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    expect(again.status).toBe(200)
    expect(again.body.id).toBe(first.body.id)
    const left = await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })
    expect(left.body.status).toBe('left')
    expect((await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })).status).toBe(200)
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(0)
    const g = await fan()
    expect((await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: g.cookie, body: {} })).body.originalPosition).toBe(2)
    const back = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    expect(back.body).toMatchObject({ id: first.body.id, status: 'active', originalPosition: 1 })
    const wall = await api(`/api/communities/${comm.id}/originals`)
    expect(wall.body.items.map((i: any) => i.position)).toEqual([1, 2])
    expect(JSON.stringify(wall.body)).not.toContain('@example.com')
  })

  it('concurrent joins never hand out more than 100 Originals positions', { timeout: 120_000 }, async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    await sql`update community set originals_assigned = 85 where id = ${comm.id}`
    const crowd = await fans(30)
    const results = await Promise.all(crowd.map(f => api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })))
    expect(results.every(r => r.status === 201)).toBe(true)
    const positions = results.map(r => r.body.originalPosition).filter((p: number | null) => p !== null).sort((x: number, y: number) => x - y)
    expect(positions).toEqual(Array.from({ length: 15 }, (_, i) => 86 + i))
    const [row] = await sql`select originals_assigned, member_count from community where id = ${comm.id}`
    expect(row).toMatchObject({ originals_assigned: 100, member_count: 30 })
  })

  it('member list is members-only and memberships are owner-only', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const member = await fan()
    const outsider = await fan()
    const joined = (await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: member.cookie, body: { alertsEnabled: false } })).body
    expect(joined.alertsEnabled).toBe(false)
    expect((await api(`/api/communities/${comm.id}/members`, { cookie: outsider.cookie })).body.error.details.reason).toBe('not_member')
    const list = await api(`/api/communities/${comm.id}/members`, { cookie: member.cookie })
    expect(list.body.items).toHaveLength(1)
    expect(JSON.stringify(list.body)).not.toMatch(/@example\.com|dateOfBirth/)
    expect((await api(`/api/memberships/${joined.id}`, { method: 'PATCH', cookie: outsider.cookie, body: { alertsEnabled: true } })).status).toBe(404)
    expect((await api(`/api/memberships/${joined.id}`, { method: 'PATCH', cookie: member.cookie, body: { alertsEnabled: true } })).body.alertsEnabled).toBe(true)
    const mine = await api('/api/me/memberships', { cookie: member.cookie })
    expect(mine.body.items[0].community.id).toBe(comm.id)
  })

  it('veto hides the community from fans but not admins; restore brings it back', async () => {
    const a = await admin()
    const f = await fan()
    const comm = await newCommunity(a)
    await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    expect((await api(`/api/admin/communities/${comm.id}/veto`, { method: 'POST', cookie: f.cookie, body: {} })).status).toBe(403)
    expect((await api(`/api/admin/communities/${comm.id}/veto`, { method: 'POST', cookie: a.cookie, body: { internalNote: 'spam' } })).body.status).toBe('vetoed')
    expect((await api(`/api/communities/${comm.id}`, { cookie: f.cookie })).status).toBe(404)
    expect((await api(`/api/communities/${comm.id}`, { cookie: a.cookie })).status).toBe(200)
    expect((await api('/api/communities?sort=newest&limit=100')).body.items.some((c: any) => c.id === comm.id)).toBe(false)
    expect((await api('/api/admin/communities?status=vetoed&limit=100', { cookie: a.cookie })).body.items.some((c: any) => c.id === comm.id)).toBe(true)
    await api(`/api/admin/communities/${comm.id}/restore`, { method: 'POST', cookie: a.cookie, body: {} })
    const restored = await api(`/api/communities/${comm.id}`, { cookie: f.cookie })
    expect(restored.body.viewerMembership).toMatchObject({ status: 'active', originalPosition: 1 })
    const [{ n }] = await sql`select count(*)::int n from admin_audit where target_id = ${comm.id}`
    expect(n).toBe(3)
  })

  it('lists by popularity with sort-scoped cursors and rejects slug clashes', async () => {
    const a = await admin()
    const c1 = await newCommunity(a)
    expect((await api('/api/admin/communities', { method: 'POST', cookie: a.cookie, body: { name: 'Dup', slug: c1.slug } })).status).toBe(409)
    const page = await api('/api/communities?sort=popular&limit=2')
    expect(page.body.items).toHaveLength(2)
    expect(page.body.items[0].memberCount).toBeGreaterThanOrEqual(page.body.items[1].memberCount)
    const next = await api(`/api/communities?sort=popular&limit=2&cursor=${encodeURIComponent(page.body.nextCursor)}`)
    expect(next.body.items[0].id).not.toBe(page.body.items[1].id)
    expect((await api(`/api/communities?sort=newest&cursor=${encodeURIComponent(page.body.nextCursor)}`)).status).toBe(400)
  })
})
