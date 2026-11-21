import { fileURLToPath } from 'node:url'
import { describe, expect, it, afterAll } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { api, catalog, newUser, signUp, sql, testEnv, verifiedSession } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

describe('conventions', () => {
  it('health reports db ok and returns a request id', async () => {
    const res = await api('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok', db: 'ok' })
    expect(res.headers.get('x-request-id')).toMatch(/^req_/)
  })
  it('unknown routes use the error envelope', async () => {
    const res = await api('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' })
    expect(res.body.error.requestId).toBe(res.headers.get('x-request-id'))
  })
})

describe('auth (AUTH-01..08)', () => {
  it('rejects under-18 sign-ups', async () => {
    const res = await signUp(newUser({ dateOfBirth: '2015-01-01' }))
    expect(res.status).toBe(400)
    expect((await res.json()).code).toBe('UNDER_MINIMUM_AGE')
  })
  it('rejects invalid usernames', async () => {
    const res = await signUp(newUser({ username: 'A!' }))
    expect(res.status).toBe(400)
  })
  it('blocks sign-in until the email is verified', async () => {
    const u = newUser()
    expect((await signUp(u)).status).toBe(200)
    const res = await api('/api/auth/sign-in/email', { method: 'POST', body: { email: u.email, password: u.password } })
    expect(res.status).toBe(403)
  })
  it('GET /api/me needs a session', async () => {
    const res = await api('/api/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHENTICATED')
  })
  it('returns me without dateOfBirth', async () => {
    const { user, cookie } = await verifiedSession()
    const res = await api('/api/me', { cookie })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ username: user.username, emailVerified: true, roles: ['fan'], onboardingStatus: 'not_started' })
    expect(res.body).not.toHaveProperty('dateOfBirth')
  })
  it('username-check reports taken and reserved names', async () => {
    const { user } = await verifiedSession()
    expect((await api(`/api/auth/username-check?username=${user.username}`)).body).toMatchObject({ available: false, reason: 'taken' })
    expect((await api('/api/auth/username-check?username=admin')).body).toMatchObject({ available: false, reason: 'reserved' })
  })
  it('PATCH /api/me changes username once per 30 days', async () => {
    const { cookie } = await verifiedSession()
    const name = `renamed_${Date.now().toString(36)}`
    expect((await api('/api/me', { method: 'PATCH', cookie, body: { username: name } })).body.username).toBe(name)
    const again = await api('/api/me', { method: 'PATCH', cookie, body: { username: `${name}2` } })
    expect(again.status).toBe(409)
    expect(again.body.error.code).toBe('INVALID_STATE')
  })
  it('DELETE /api/me requires a verified email', async () => {
    const u = newUser()
    await signUp(u)
    await sql`update "user" set email_verified = true where email = ${u.email}`
    const login = await api('/api/auth/sign-in/email', { method: 'POST', body: { email: u.email, password: u.password } })
    expect(login.status).toBe(200)
    await sql`update "user" set email_verified = false where email = ${u.email}`
    const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')
    const res = await api('/api/me', { method: 'DELETE', cookie, body: { password: u.password } })
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED')
  })
  it('DELETE /api/me schedules deletion, logs out, and sign-in restores', async () => {
    const { user, cookie } = await verifiedSession()
    expect((await api('/api/me', { method: 'DELETE', cookie, body: { password: 'wrong-password' } })).status).toBe(403)
    const res = await api('/api/me', { method: 'DELETE', cookie, body: { password: user.password } })
    expect(res.status).toBe(202)
    expect(res.body.status).toBe('pending_deletion')
    expect((await api('/api/me', { cookie })).status).toBe(401)
    const login = await api('/api/auth/sign-in/email', { method: 'POST', body: { email: user.email, password: user.password } })
    expect(login.status).toBe(200)
    const [row] = await sql`select status from "user" where email = ${user.email}`
    expect(row!.status).toBe('active')
  })
})

describe('catalog + onboarding (CAT, ONB)', () => {
  it('lists inactive categories as not selectable', async () => {
    const { music } = await catalog()
    expect(music.active).toBe(false)
  })
  it('lists Stars by category, with their "known for" line', async () => {
    const { realityTv, music, ada } = await catalog()
    expect(ada).toMatchObject({ categoryId: realityTv.id, knownFor: expect.any(String) })
    expect((await api(`/api/talents?categoryId=${music.id}`)).body.items).toEqual([])
    expect((await api('/api/shows')).status).toBe(404)
  })
  it('unverified users get EMAIL_NOT_VERIFIED', async () => {
    const u = newUser()
    await signUp(u)
    await sql`update "user" set email_verified = true where email = ${u.email}`
    const login = await api('/api/auth/sign-in/email', { method: 'POST', body: { email: u.email, password: u.password } })
    expect(login.status).toBe(200)
    await sql`update "user" set email_verified = false where email = ${u.email}`
    const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')
    const res = await api('/api/onboarding', { cookie })
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED')
  })
  it('saves progress, resumes, then completes', async () => {
    const { realityTv, ada } = await catalog()
    const { cookie } = await verifiedSession()
    expect((await api('/api/onboarding', { cookie })).body).toMatchObject({ status: 'not_started', nextStep: 'category' })
    const saved = await api('/api/onboarding', { method: 'PUT', cookie, body: { categoryId: realityTv.id } })
    expect(saved.body).toMatchObject({ status: 'in_progress', nextStep: 'stars' })
    expect((await api('/api/onboarding', { cookie })).body.selections.categoryId).toBe(realityTv.id)
    const done = await api('/api/onboarding/complete', { method: 'POST', cookie, body: { categoryId: realityTv.id, talentIds: [ada.id] } })
    expect(done.status).toBe(200)
    expect(done.body).toMatchObject({ status: 'completed', nextStep: null })
    expect((await api('/api/me', { cookie })).body.onboardingStatus).toBe('completed')
    const repeat = await api('/api/onboarding/complete', { method: 'POST', cookie, body: { categoryId: realityTv.id, talentIds: [ada.id] } })
    expect(repeat.status).toBe(200)
  })
  it('requires at least one Star from an active category', async () => {
    const { realityTv, music, ada } = await catalog()
    const { cookie } = await verifiedSession()
    const noStar = await api('/api/onboarding/complete', { method: 'POST', cookie, body: { categoryId: realityTv.id, talentIds: [] } })
    expect(noStar.status).toBe(400)
    expect(noStar.body.error.details.fields.talentIds).toBeDefined()
    const inactive = await api('/api/onboarding/complete', { method: 'POST', cookie, body: { categoryId: music.id, talentIds: [ada.id] } })
    expect(inactive.body.error.details.fields.categoryId).toBe('inactive')
    expect(inactive.body.error.details.fields['talentIds[0]']).toBe('not_in_category')
    const oldShape = await api('/api/onboarding/complete', { method: 'POST', cookie, body: { categoryId: realityTv.id, talentIds: [ada.id], showIds: [ada.id] } })
    expect(oldShape.status).toBe(400)
  })
})
