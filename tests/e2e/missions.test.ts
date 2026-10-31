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
const join = (s: S, id: string) => api(`/api/communities/${id}/join`, { method: 'POST', cookie: s.cookie, body: {} })
const createMission = (s: S, body: Record<string, unknown>) => api('/api/missions', { method: 'POST', cookie: s.cookie, body: { title: 'Vote tonight', xpReward: 50, completionPolicy: { review: 'auto', proof: 'none' }, ...body } })
const complete = (s: S, id: string, body: Record<string, unknown> = {}) => api(`/api/missions/${id}/completions`, { method: 'POST', cookie: s.cookie, body })
const balance = async (s: S) => (await api('/api/xp/me', { cookie: s.cookie })).body

describe('missions, completions, XP and badges (MIS-01..10, XP-01..02, BDG-01..02, ADM-15..17)', () => {
  it('only the talent creates missions within the admin XP range', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    expect((await createMission(f, { communityId })).status).toBe(403)
    expect((await createMission(talent, { communityId, xpReward: 1000 })).body.error.details.fields.xpReward).toBe('out_of_range')
    expect((await createMission(talent, { communityId, completionPolicy: { review: 'owner', proof: 'none' } })).status).toBe(400)
    expect((await createMission(talent, { communityId, deadline: '2020-01-01T00:00:00Z' })).status).toBe(400)
    expect((await api('/api/admin/xp-rules', { method: 'PUT', cookie: talent.cookie, body: { missionXpMin: 1, missionXpMax: 2000 } })).status).toBe(403)
    expect((await api('/api/admin/xp-rules', { method: 'PUT', cookie: a.cookie, body: { missionXpMin: 9, missionXpMax: 1 } })).status).toBe(400)
    try {
      expect((await api('/api/admin/xp-rules', { method: 'PUT', cookie: a.cookie, body: { missionXpMin: 5, missionXpMax: 2000 } })).status).toBe(200)
      expect((await createMission(talent, { communityId, xpReward: 1000 })).status).toBe(201)
    }
    finally {
      await api('/api/admin/xp-rules', { method: 'PUT', cookie: a.cookie, body: { missionXpMin: 5, missionXpMax: 100 } })
    }
    expect((await api('/api/admin/xp-rules', { cookie: a.cookie })).body).toEqual({ missionXpMin: 5, missionXpMax: 100 })
  })

  it('10 parallel auto-approved submissions → one completion and one ledger row', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    const outsider = await fan()
    await join(f, communityId)
    const m = (await createMission(talent, { communityId, xpReward: 40 })).body
    expect((await complete(outsider, m.id)).body.error.details.reason).toBe('not_member')
    const results = await Promise.all(Array.from({ length: 10 }, () => complete(f, m.id)))
    expect(results.filter(r => r.status === 201)).toHaveLength(1)
    expect(new Set(results.map(r => r.body.id)).size).toBe(1)
    expect(results[0]!.body.status).toBe('approved')
    const [{ n }] = await sql`select count(*)::int as n from xp_transaction where user_id = ${f.id}`
    expect(n).toBe(1)
    expect(await balance(f)).toEqual({ balance: 40, lifetimeEarned: 40 })
    const listed = (await api(`/api/missions?communityId=${communityId}`, { cookie: f.cookie })).body.items
    expect(listed[0]).toMatchObject({ id: m.id, viewerCompletion: { status: 'approved' } })
    expect((await api(`/api/missions/${m.id}/completions/me`, { cookie: f.cookie })).body.items).toHaveLength(1)
  })

  it('expired missions give no XP and move to the expired list', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const f = await fan()
    await join(f, communityId)
    const m = (await createMission(talent, { communityId, deadline: new Date(Date.now() + 3600_000).toISOString() })).body
    await sql`update mission set deadline = now() - interval '1 second' where id = ${m.id}`
    const late = await complete(f, m.id)
    expect(late.status).toBe(409)
    expect(late.body.error.details.currentStatus).toBe('expired')
    expect((await balance(f)).balance).toBe(0)
    expect((await api(`/api/missions?communityId=${communityId}`)).body.items).toEqual([])
    expect((await api(`/api/missions?communityId=${communityId}&status=expired`)).body.items.map((i: any) => i.id)).toEqual([m.id])
  })

  it('reviewed missions: proof required, owner approves once or rejects with a reason', async () => {
    const a = await admin()
    const { talent, communityId } = await talentWithCommunity(a)
    const [f1, f2, stranger] = [await fan(), await fan(), await fan()]
    await join(f1, communityId)
    await join(f2, communityId)
    const m = (await createMission(talent, { communityId, xpReward: 60, completionPolicy: { review: 'owner', proof: 'link' } })).body
    expect((await complete(f1, m.id)).status).toBe(400)
    expect((await complete(f1, m.id, { proof: { link: 'http://insecure.example' } })).status).toBe(400)
    const c1 = (await complete(f1, m.id, { proof: { link: 'https://x.com/vote/1' } })).body
    const c2 = (await complete(f2, m.id, { proof: { link: 'https://x.com/vote/2' } })).body
    expect(c1).toMatchObject({ status: 'submitted', proof: { link: 'https://x.com/vote/1' } })
    expect((await api(`/api/missions/${m.id}/completions`, { cookie: stranger.cookie })).status).toBe(403)
    expect((await api(`/api/missions/${m.id}/completions?status=submitted`, { cookie: talent.cookie })).body.items.map((i: any) => i.id)).toEqual([c1.id, c2.id])
    const approve = (id: string) => api(`/api/mission-completions/${id}/approve`, { method: 'POST', cookie: talent.cookie, body: {} })
    expect((await api(`/api/mission-completions/${c1.id}/approve`, { method: 'POST', cookie: stranger.cookie, body: {} })).status).toBe(403)
    expect((await approve(c1.id)).body.status).toBe('approved')
    expect((await approve(c1.id)).status).toBe(200)
    expect((await balance(f1)).balance).toBe(60)
    expect((await api(`/api/mission-completions/${c1.id}/reject`, { method: 'POST', cookie: talent.cookie, body: { reason: 'x' } })).body.error.code).toBe('INVALID_STATE')
    expect((await api(`/api/mission-completions/${c2.id}/reject`, { method: 'POST', cookie: talent.cookie, body: {} })).status).toBe(400)
    expect((await api(`/api/mission-completions/${c2.id}/reject`, { method: 'POST', cookie: talent.cookie, body: { reason: 'screenshot is not a vote' } })).body.status).toBe('rejected')
    expect((await approve(c2.id)).body.error.code).toBe('INVALID_STATE')
    expect((await balance(f2)).balance).toBe(0)
    const types = (await sql`select type from notification where user_id in (${f1.id}, ${f2.id}) and type like 'mission.%' order by type`).map(r => r.type)
    expect(types).toEqual(['mission.completion_approved', 'mission.completion_rejected'])
  })

  it('XP corrections are audited ledger rows; badges are awarded once', async () => {
    const a = await admin()
    const f = await fan()
    const adj = (body: Record<string, unknown>) => api('/api/admin/xp-adjustments', { method: 'POST', cookie: a.cookie, body })
    expect((await adj({ userId: f.id, amount: 0, reason: 'x' })).status).toBe(400)
    expect((await adj({ userId: f.id, amount: 30 })).status).toBe(400)
    expect((await adj({ userId: f.id, amount: 30, reason: 'event prize' })).status).toBe(201)
    expect((await adj({ userId: f.id, amount: -10, reason: 'fraudulent proof' })).status).toBe(201)
    expect(await balance(f)).toEqual({ balance: 20, lifetimeEarned: 30 })
    const tx = (await api('/api/xp/me/transactions?limit=1', { cookie: f.cookie })).body
    expect(tx.items[0]).toMatchObject({ amount: -10, sourceType: 'admin_adjustment', reason: 'fraudulent proof' })
    const next = (await api(`/api/xp/me/transactions?limit=1&cursor=${encodeURIComponent(tx.nextCursor)}`, { cookie: f.cookie })).body
    expect(next.items[0].amount).toBe(30)
    const [{ n }] = await sql`select count(*)::int as n from admin_audit where action = 'xp.adjusted' and target_id = ${f.id}`
    expect(n).toBe(2)

    expect((await api('/api/admin/badges', { method: 'POST', cookie: f.cookie, body: { name: 'x' } })).status).toBe(403)
    const b = (await api('/api/admin/badges', { method: 'POST', cookie: a.cookie, body: { name: `Early Bird ${Math.random()}`, sortOrder: 1 } })).body
    expect((await api('/api/badges?limit=100')).body.items.map((i: any) => i.id)).toContain(b.id)
    const award = () => api(`/api/admin/badges/${b.id}/awards`, { method: 'POST', cookie: a.cookie, body: { userId: f.id } })
    expect((await award()).status).toBe(201)
    expect((await award()).status).toBe(200)
    expect((await api('/api/badges/me', { cookie: f.cookie })).body.items.map((i: any) => i.badge.id)).toEqual([b.id])
    expect((await api(`/api/admin/badges/${b.id}`, { method: 'PATCH', cookie: a.cookie, body: { active: false } })).body.active).toBe(false)
    expect((await api('/api/badges?limit=100')).body.items.map((i: any) => i.id)).not.toContain(b.id)
    expect((await api(`/api/admin/badges/${b.id}`, { cookie: a.cookie })).body.active).toBe(false)
  })
})
