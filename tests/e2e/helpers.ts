import postgres from 'postgres'
import { $fetch, fetch, url } from '@nuxt/test-utils/e2e'

export const TEST_DB = (process.env.TEST_DATABASE_ADMIN_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres').replace(/\/[^/]*$/, '/clautverse_test')
export const sql = postgres(TEST_DB, { max: 2 })

export const testEnv = {
  NUXT_DATABASE_URL: TEST_DB,
  NUXT_BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-1234',
  NUXT_BETTER_AUTH_URL: 'http://localhost',
  NUXT_CURSOR_SECRET: 'cursor-secret',
  NUXT_CRON_SECRET: 'test-cron-secret',
  NUXT_AUTH_RATE_LIMIT_ENABLED: 'false',
}

let n = 0
export function newUser(overrides: Record<string, unknown> = {}) {
  n++
  const id = `${Date.now().toString(36)}${n}`
  return { email: `fan${id}@example.com`, password: 'correct-horse-9', name: 'Fan', username: `fan_${id}`, dateOfBirth: '1995-05-05', ...overrides }
}

export async function signUp(body: Record<string, unknown>) {
  return fetch('/api/auth/sign-up/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: url('/').replace(/\/$/, '') }, body: JSON.stringify(body) })
}

/** Signs up, marks the email verified directly in the DB, signs in, and returns a cookie header. */
export async function verifiedSession(overrides: Record<string, unknown> = {}) {
  const u = newUser(overrides)
  const res = await signUp(u)
  if (res.status !== 200) throw new Error(`sign-up failed ${res.status} ${await res.text()}`)
  await sql`update "user" set email_verified = true where email = ${u.email}`
  const login = await fetch('/api/auth/sign-in/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: url('/').replace(/\/$/, '') }, body: JSON.stringify({ email: u.email, password: u.password }) })
  if (login.status !== 200) throw new Error(`sign-in failed ${login.status} ${await login.text()}`)
  const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')
  return { user: u, cookie }
}

export async function api(path: string, init: { method?: string, body?: unknown, cookie?: string, headers?: Record<string, string> } = {}) {
  const res = await fetch(path, {
    method: init.method ?? 'GET',
    headers: { 'content-type': 'application/json', ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await res.text()
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null }
}

export async function catalog() {
  const categories = (await $fetch<any>('/api/categories')).items
  const realityTv = categories.find((c: any) => c.slug === 'reality-tv')
  const music = categories.find((c: any) => c.slug === 'music')
  const shows = (await $fetch<any>(`/api/shows?categoryId=${realityTv.id}`)).items
  const bbnaija = shows.find((s: any) => s.slug === 'bbnaija')
  const seasons = (await $fetch<any>(`/api/seasons?showId=${bbnaija.id}`)).items
  return { realityTv, music, bbnaija, seasons }
}
