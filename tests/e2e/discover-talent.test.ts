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
  const [c] = await sql`select c.id, c.owner_talent_id from community c join talent tl on tl.id = c.owner_talent_id where tl.user_id = ${t.id}`
  return { talent: t, communityId: c!.id as string, talentId: c!.owner_talent_id as string }
}
const keys = (b: any) => b.sections.map((s: any) => s.key)
const section = (b: any, k: string) => b.sections.find((s: any) => s.key === k).items.map((i: any) => i.id)

describe('Discover, community edit, talent dashboard and profile (DIS-01, COM-10, TAL-06, TAL-07)', () => {
  it('Discover personalises from onboarding picks and hides joined communities', async () => {
    const a = await admin()
    const { communityId, talentId } = await talentWithCommunity(a)
    const f = await fan()
    const anon = (await api('/api/discover')).body
    expect(keys(anon)).toEqual(['popular_communities', 'new_talents'])
    expect(section(anon, 'new_talents')).toContain(talentId)
    await sql`insert into onboarding (user_id, talent_ids) values (${f.id}, ${[talentId]}::uuid[])
      on conflict (user_id) do update set talent_ids = excluded.talent_ids`
    const before = (await api('/api/discover', { cookie: f.cookie })).body
    expect(keys(before)).toEqual(['for_you', 'popular_communities', 'new_talents'])
    expect(section(before, 'for_you')).toEqual([communityId])
    await api(`/api/communities/${communityId}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    const after = (await api('/api/discover', { cookie: f.cookie })).body
    expect(section(after, 'for_you')).toEqual([])
    expect(section(after, 'popular_communities')).not.toContain(communityId)
    await api(`/api/admin/communities/${communityId}/veto`, { method: 'POST', cookie: a.cookie, body: {} })
    expect(section((await api('/api/discover')).body, 'new_talents')).not.toContain(talentId)
  })

  it('talent dashboard shows own stats; profile and community edits are scoped', async () => {
    const a = await admin()
    const { talent, communityId, talentId } = await talentWithCommunity(a)
    const f = await fan()
    expect((await api('/api/talent/dashboard', { cookie: f.cookie })).status).toBe(403)
    await api(`/api/communities/${communityId}/join`, { method: 'POST', cookie: f.cookie, body: {} })
    const m = (await api('/api/missions', { method: 'POST', cookie: talent.cookie, body: { communityId, title: 'Share', xpReward: 10, completionPolicy: { review: 'owner', proof: 'text' } } })).body
    await api(`/api/missions/${m.id}/completions`, { method: 'POST', cookie: f.cookie, body: { proof: { text: 'done' } } })
    const p = (await api('/api/watch-parties', { method: 'POST', cookie: talent.cookie, body: { communityId, title: 'Live', startsAt: new Date(Date.now() + 86400_000).toISOString(), timeZone: 'Africa/Lagos' } })).body
    await api(`/api/watch-parties/${p.id}/rsvp`, { method: 'PUT', cookie: f.cookie })
    const d = (await api('/api/talent/dashboard', { cookie: talent.cookie })).body
    expect(d.talent.id).toBe(talentId)
    expect(d.community.id).toBe(communityId)
    expect(d.stats).toEqual({ memberCount: 1, originalsCount: 1, newMembers7d: 1, pendingMissionApprovals: 1, upcomingWatchParties: 1, upcomingRsvps: 1 })

    expect((await api('/api/talent/profile', { method: 'PATCH', cookie: f.cookie, body: { bio: 'x' } })).status).toBe(403)
    expect((await api('/api/talent/profile', { method: 'PATCH', cookie: talent.cookie, body: { isClaimed: false } })).status).toBe(400)
    expect((await api('/api/talent/profile', { method: 'PATCH', cookie: talent.cookie, body: { imageMediaId: 'm1' } })).body.error.code).toBe('FEATURE_DISABLED')
    const prof = (await api('/api/talent/profile', { method: 'PATCH', cookie: talent.cookie, body: { bio: 'Lagos-born', links: [{ label: 'IG', url: 'https://instagram.com/star' }] } })).body
    expect(prof).toMatchObject({ id: talentId, bio: 'Lagos-born', links: [{ label: 'IG', url: 'https://instagram.com/star' }], isClaimed: true })

    expect((await api(`/api/communities/${communityId}`, { method: 'PATCH', cookie: f.cookie, body: { description: 'x' } })).status).toBe(403)
    expect((await api(`/api/communities/${communityId}`, { method: 'PATCH', cookie: talent.cookie, body: { status: 'vetoed' } })).status).toBe(400)
    expect((await api(`/api/communities/${communityId}`, { method: 'PATCH', cookie: talent.cookie, body: { description: 'Welcome!' } })).body.description).toBe('Welcome!')
    expect((await api(`/api/communities/${communityId}`, { method: 'PATCH', cookie: a.cookie, body: { rules: 'Be kind' } })).body.rules).toBe('Be kind')
    const [{ n }] = await sql`select count(*)::int as n from admin_audit where action = 'community.updated' and target_id = ${communityId}`
    expect(n).toBe(1)
  })
})
