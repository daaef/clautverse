import { fileURLToPath } from 'node:url'
import { afterAll, describe, expect, it } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'
import { newUser, signUp, sql, testEnv } from './helpers'

await setup({ rootDir: fileURLToPath(new URL('../..', import.meta.url)), server: true, browser: false, env: testEnv })
afterAll(() => sql.end())

// Regression: hooks querying outside Better Auth's transaction exhausted the DB pool under load.
describe('concurrent sign-ups', () => {
  it('12 simultaneous sign-ups all complete', { timeout: 60_000 }, async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => signUp(newUser())))
    expect(results.map(r => r.status)).toEqual(Array(12).fill(200))
  })
})
