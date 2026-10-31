import { execSync } from 'node:child_process'
import postgres from 'postgres'

// Creates a fresh test database, migrates and seeds it.
export default async function () {
  const base = process.env.TEST_DATABASE_ADMIN_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres'
  const admin = postgres(base, { max: 1 })
  await admin.unsafe('drop database if exists clautverse_test with (force)')
  await admin.unsafe('create database clautverse_test')
  await admin.end()
  const url = base.replace(/\/[^/]*$/, '/clautverse_test')
  process.env.NUXT_DATABASE_URL = url
  const env = { ...process.env, NUXT_DATABASE_URL: url }
  execSync('pnpm exec drizzle-kit migrate', { env, stdio: 'inherit' })
  execSync('node scripts/seed.mjs', { env, stdio: 'inherit' })
}
