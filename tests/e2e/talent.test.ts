import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { api, catalog, sql, testEnv, verifiedSession } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

async function adminSession() {
  const s = await verifiedSession()
  await sql`update "user" set roles = 'fan,super_admin' where email = ${s.user.email}`
  return s
}
const apply = (cookie: string, categoryId: string, extra: Record<string, unknown> = {}) =>
  api('/api/talent-applications', { method: 'POST', cookie, body: { categoryId, displayName: 'Rising Star', bio: 'Hi', links: [{ label: 'IG', url: 'https://instagram.com/x' }], ...extra } })

describe('talent applications (TAL-01..03, ADM-02..05)', () => {
  it('validates input and allows only one pending application', async () => {
    const { realityTv, music } = await catalog()
    const { cookie } = await verifiedSession()
    expect((await apply(cookie, music.id)).body.error.code).toBe('VALIDATION_FAILED')
    expect((await apply(cookie, realityTv.id, { links: [{ label: 'x', url: 'http://insecure.com' }] })).status).toBe(400)
    expect((await apply(cookie, realityTv.id, { evidenceMediaIds: ['m1'] })).body.error.code).toBe('FEATURE_DISABLED')
    const first = await apply(cookie, realityTv.id)
    expect(first.status).toBe(201)
    expect(first.body).toMatchObject({ status: 'pending', displayName: 'Rising Star' })
    expect(first.body).not.toHaveProperty('internalNote')
    const second = await apply(cookie, realityTv.id)
    expect(second.status).toBe(409)
    expect(second.body.error.details.existingId).toBe(first.body.id)
    const edited = await api(`/api/talent-applications/${first.body.id}`, { method: 'PATCH', cookie, body: { bio: 'Updated' } })
    expect(edited.body.bio).toBe('Updated')
  })

  it('admin-only queue; accept creates talent, community, role, audit and notification atomically', async () => {
    const { realityTv } = await catalog()
    const fan = await verifiedSession()
    const admin = await adminSession()
    const app = (await apply(fan.cookie, realityTv.id, { displayName: 'Queue Star' })).body
    expect((await api('/api/admin/applications', { cookie: fan.cookie })).status).toBe(403)
    const queue = await api('/api/admin/applications?limit=100', { cookie: admin.cookie })
    expect(queue.body.items.some((i: any) => i.id === app.id && i.applicant.email === fan.user.email)).toBe(true)
    const accepted = await api(`/api/admin/applications/${app.id}/accept`, { method: 'POST', cookie: admin.cookie, body: { internalNote: 'looks legit' } })
    expect(accepted.status).toBe(200)
    expect(accepted.body.status).toBe('accepted')
    const again = await api(`/api/admin/applications/${app.id}/accept`, { method: 'POST', cookie: admin.cookie, body: {} })
    expect(again.status).toBe(200)
    expect((await api(`/api/admin/applications/${app.id}/decline`, { method: 'POST', cookie: admin.cookie, body: { decisionReason: 'no' } })).body.error.code).toBe('INVALID_STATE')
    const [{ roles }] = await sql`select roles from "user" where email = ${fan.user.email}`
    expect(roles.split(',')).toContain('talent')
    const [comm] = await sql`select c.* from community c join talent t on t.id = c.owner_talent_id where t.id = ${accepted.body.talentId}`
    expect(comm).toMatchObject({ name: 'Queue Star', status: 'active' })
    const [{ n: audits }] = await sql`select count(*)::int n from admin_audit where target_id = ${app.id} and action = 'application.accepted'`
    expect(audits).toBe(1)
    const [{ n: notes }] = await sql`select count(*)::int n from notification n join "user" u on u.id = n.user_id where u.email = ${fan.user.email} and n.type = 'talent_application.accepted'`
    expect(notes).toBe(1)
    const mine = await api('/api/talent-applications/me', { cookie: fan.cookie })
    expect(mine.body.items[0]).not.toHaveProperty('internalNote')
    expect((await apply(fan.cookie, realityTv.id)).status).toBe(403)
  })

  it('decline needs a reason and blocks reapplying for 7 days', async () => {
    const { realityTv } = await catalog()
    const fan = await verifiedSession()
    const admin = await adminSession()
    const app = (await apply(fan.cookie, realityTv.id)).body
    expect((await api(`/api/admin/applications/${app.id}/decline`, { method: 'POST', cookie: admin.cookie, body: {} })).status).toBe(400)
    const declined = await api(`/api/admin/applications/${app.id}/decline`, { method: 'POST', cookie: admin.cookie, body: { decisionReason: 'Add more links' } })
    expect(declined.body).toMatchObject({ status: 'declined', decisionReason: 'Add more links' })
    const retry = await apply(fan.cookie, realityTv.id)
    expect(retry.body.error.code).toBe('INVALID_STATE')
    expect(retry.body.error.details.reapplyAfter).toBeTruthy()
    await sql`update talent_application set decided_at = now() - interval '8 days' where id = ${app.id}`
    expect((await apply(fan.cookie, realityTv.id)).status).toBe(201)
  })
})

describe('identity claims (TAL-04..05, ADM-06..07b)', () => {
  it('verify links the talent, auto-rejects rivals, and audits evidence views', async () => {
    const [tal] = await sql`insert into talent (slug, name) values (${`claimable-${Date.now()}`}, 'Claimable') returning id`
    const a = await verifiedSession()
    const b = await verifiedSession()
    const admin = await adminSession()
    const body = { evidenceLinks: ['https://instagram.com/me'] }
    expect((await api(`/api/talents/${tal.id}/claims`, { method: 'POST', cookie: a.cookie, body: {} })).status).toBe(400)
    const claimA = await api(`/api/talents/${tal.id}/claims`, { method: 'POST', cookie: a.cookie, body })
    expect(claimA.status).toBe(201)
    expect((await api(`/api/talents/${tal.id}/claims`, { method: 'POST', cookie: a.cookie, body })).status).toBe(409)
    const claimB = await api(`/api/talents/${tal.id}/claims`, { method: 'POST', cookie: b.cookie, body })
    const detail = await api(`/api/admin/claims/${claimA.body.id}`, { cookie: admin.cookie })
    expect(detail.body.evidenceLinks).toEqual(body.evidenceLinks)
    const [{ n }] = await sql`select count(*)::int n from admin_audit where target_id = ${claimA.body.id} and action = 'claim.evidence_viewed'`
    expect(n).toBe(1)
    expect((await api(`/api/admin/claims/${claimA.body.id}/verify`, { method: 'POST', cookie: admin.cookie, body: {} })).body.status).toBe('verified')
    const bMine = await api('/api/identity-claims/me', { cookie: b.cookie })
    expect(bMine.body.items.find((c: any) => c.id === claimB.body.id).status).toBe('rejected')
    expect((await api(`/api/talents/${tal.id}/claims`, { method: 'POST', cookie: b.cookie, body })).body.error.code).toBe('INVALID_STATE')
    const pub = await api(`/api/talents/${tal.id}`)
    expect(JSON.stringify(pub.body)).not.toContain('instagram.com/me')
    const [{ c }] = await sql`select count(*)::int c from community where owner_talent_id = ${tal.id}`
    expect(c).toBe(1)
  })

  it('admin dashboard counts are admin-only', async () => {
    const fan = await verifiedSession()
    const admin = await adminSession()
    expect((await api('/api/admin/dashboard', { cookie: fan.cookie })).status).toBe(403)
    const dash = await api('/api/admin/dashboard', { cookie: admin.cookie })
    expect(dash.body.counts).toMatchObject({ openReports: 0 })
    expect(dash.body.counts.users).toBeGreaterThan(0)
  })
})

describe('audit log (ADM-14)', () => {
  it('is admin-only, filterable and paginated newest first', async () => {
    const fan = await verifiedSession()
    const admin = await adminSession()
    expect((await api('/api/admin/audit', { cookie: fan.cookie })).status).toBe(403)
    const first = await api('/api/admin/audit?targetType=identity_claim&limit=1', { cookie: admin.cookie })
    expect(first.status).toBe(200)
    expect(first.body.items).toHaveLength(1)
    expect(first.body.items[0].targetType).toBe('identity_claim')
    if (first.body.nextCursor) {
      const next = await api(`/api/admin/audit?targetType=identity_claim&limit=1&cursor=${encodeURIComponent(first.body.nextCursor)}`, { cookie: admin.cookie })
      expect(next.body.items[0].id).not.toBe(first.body.items[0].id)
    }
    expect((await api('/api/admin/audit?cursor=bogus', { cookie: admin.cookie })).status).toBe(400)
    expect((await api(`/api/admin/audit/${first.body.items[0].id}`, { method: 'DELETE', cookie: admin.cookie })).status).toBe(404)
  })
})
