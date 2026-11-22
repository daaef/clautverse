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
  it.each([
    ['missing', {}],
    ['invalid', { lane: 'not_a_real_lane' }],
    ['empty', { lane: '' }],
    ['array', { lane: ['rider', 'mutual'] }],
    ['null', { lane: null }],
    ['oversized', { lane: 'x'.repeat(10_000) }],
  ])('rejects a %s lane without creating a membership', async (_label, body) => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const res = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_FAILED', message: 'Some fields are invalid.' })
    expect(res.body.error.details.fields.lane).toEqual(expect.any(String))
    expect(res.body.error.details.fields.lane.length).toBeGreaterThan(0)
    const [{ n }] = await sql`select count(*)::int n from membership where community_id = ${comm.id}`
    expect(n).toBe(0)
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(0)
  })

  it.each(['rider', 'fandom_builder', 'builder', 'analyst', 'creator', 'mutual'])('accepts the %s lane and exposes it in the members list', async (lane) => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const res = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane } })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ status: 'active', lane })
    const [row] = await sql`select lane from membership where id = ${res.body.id}`
    expect(row.lane).toBe(lane)
    const list = await api(`/api/communities/${comm.id}/members`, { cookie: f.cookie })
    expect(list.body.items).toHaveLength(1)
    expect(list.body.items[0].lane).toBe(lane)
  })

  it('requires a fresh lane after leaving and does not reactivate on a missing lane', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(first.status).toBe(201)
    expect((await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })).body.status).toBe('left')
    const missing = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    expect(missing.status).toBe(400)
    expect(missing.body.error.code).toBe('VALIDATION_FAILED')
    expect(missing.body.error.details.fields.lane).toEqual(expect.any(String))
    const [row] = await sql`select status from membership where id = ${first.body.id}`
    expect(row.status).toBe('left')
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(0)
  })

  it('reactivates a left membership with a freshly submitted lane', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(first.status).toBe(201)
    expect((await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })).body.status).toBe('left')
    const back = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'creator' } })
    expect(back.status).toBe(200)
    // DEC-04: leave retires the position; rejoining reactivates the row without reassigning one.
    expect(back.body).toMatchObject({ id: first.body.id, status: 'active', lane: 'creator', leftAt: null, originalPosition: null })
    const [row] = await sql`select lane, status from membership where id = ${first.body.id}`
    expect(row).toMatchObject({ lane: 'creator', status: 'active' })
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(1)
  })

  it('keeps the original lane on an active-member duplicate join with a different lane', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(first.status).toBe(201)
    const again = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'mutual' } })
    expect(again.status).toBe(200)
    expect(again.body).toEqual(first.body)
    const [row] = await sql`select lane from membership where id = ${first.body.id}`
    expect(row.lane).toBe('rider')
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(1)
  })

  it('continues to block a removed member with a valid lane', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(first.status).toBe(201)
    // A first removal with the 30-day window still running.
    await sql`update membership set status = 'removed', removal_count = 1, blocked_until = now() + interval '30 days' where id = ${first.body.id}`
    const res = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'mutual' } })
    expect(res.status).toBe(403)
    expect(res.body.error).toMatchObject({ code: 'FORBIDDEN', details: { reason: 'removed' } })
    const [row] = await sql`select lane, status from membership where id = ${first.body.id}`
    expect(row).toMatchObject({ lane: 'rider', status: 'removed' })
  })

  it('concurrent same-user joins return one winning lane without double-counting', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const results = await Promise.all(['rider', 'mutual'].map(lane => api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane } })))
    expect(results.map(r => r.status).sort()).toEqual([200, 201])
    expect(results[0]!.body.id).toBe(results[1]!.body.id)
    expect(results[0]!.body.lane).toBe(results[1]!.body.lane)
    expect(['rider', 'mutual']).toContain(results[0]!.body.lane)
    const rows = await sql`select lane from membership where community_id = ${comm.id}`
    expect(rows).toHaveLength(1)
    expect(rows[0]!.lane).toBe(results[0]!.body.lane)
    const [row] = await sql`select member_count, originals_assigned from community where id = ${comm.id}`
    expect(row).toMatchObject({ member_count: 1, originals_assigned: 1 })
  })

  it('join is idempotent, requires onboarding, and leave retires the Originals number', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const notOnboarded = await verifiedSession()
    expect((await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: notOnboarded.cookie, body: { lane: 'rider' } })).body.error.code).toBe('ONBOARDING_REQUIRED')
    const f = await fan()
    const first = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(first.status).toBe(201)
    expect(first.body.originalPosition).toBe(1)
    const again = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    expect(again.status).toBe(200)
    expect(again.body.id).toBe(first.body.id)
    const left = await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })
    expect(left.body).toMatchObject({ status: 'left', originalPosition: null, lane: null })
    expect((await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })).status).toBe(200)
    expect((await api(`/api/communities/${comm.id}`)).body.memberCount).toBe(0)
    const g = await fan()
    expect((await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: g.cookie, body: { lane: 'rider' } })).body.originalPosition).toBe(2)
    const back = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
    // DEC-04: the retired position is never re-issued; rejoin leaves it null and the counter stays consumed.
    expect(back.body).toMatchObject({ id: first.body.id, status: 'active', originalPosition: null })
    const wall = await api(`/api/communities/${comm.id}/originals`)
    expect(wall.body.items.map((i: any) => i.position)).toEqual([2])
    expect(JSON.stringify(wall.body)).not.toContain('@example.com')
  })

  it('leave clears lane and position, keeps the slot consumed, and never counts as a removal', async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    const f = await fan()
    const joined = (await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'analyst' } })).body
    // Leaving a community you are not a member of 404s.
    const outsider = await fan()
    expect((await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: outsider.cookie })).status).toBe(404)
    const left = await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })
    expect(left.body).toMatchObject({ status: 'left', lane: null, originalPosition: null })
    // Double-leave is idempotent: identical state, the same leftAt is returned both times.
    const again = await api(`/api/communities/${comm.id}/leave`, { method: 'POST', cookie: f.cookie })
    expect(again.status).toBe(200)
    expect(again.body.leftAt).toBe(left.body.leftAt)
    // Voluntary leave never touches the DEC-03 removal counters.
    const [row] = await sql`select lane, original_position, removal_count, blocked_until from membership where id = ${joined.id}`
    expect(row).toMatchObject({ lane: null, original_position: null, removal_count: 0, blocked_until: null })
    const [c] = await sql`select originals_assigned from community where id = ${comm.id}`
    expect(c.originals_assigned).toBe(1)
    // Rejoin is immediate and unconstrained; it does not reassign a position.
    const back = await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'mutual' } })
    expect(back.body).toMatchObject({ status: 'active', originalPosition: null, lane: 'mutual' })
    const [c2] = await sql`select originals_assigned from community where id = ${comm.id}`
    expect(c2.originals_assigned).toBe(1)
  })

  it('concurrent joins never hand out more than 100 Originals positions', { timeout: 120_000 }, async () => {
    const a = await admin()
    const comm = await newCommunity(a)
    await sql`update community set originals_assigned = 85 where id = ${comm.id}`
    const crowd = await fans(30)
    const results = await Promise.all(crowd.map(f => api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })))
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
    const joined = (await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: member.cookie, body: { lane: 'rider', alertsEnabled: false } })).body
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
    await api(`/api/communities/${comm.id}/join`, { method: 'POST', cookie: f.cookie, body: { lane: 'rider' } })
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
