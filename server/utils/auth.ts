import { betterAuth } from 'better-auth'
import { APIError } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

export const USERNAME_RE = /^[a-z0-9_]{3,30}$/
export const RESERVED_USERNAMES = new Set(['admin', 'administrator', 'clautverse', 'support', 'help', 'api', 'root', 'system', 'moderator', 'me'])
export const DELETION_GRACE_DAYS = 30

function createAuth() {
  const config = useRuntimeConfig()
  const db = useDb()
  return betterAuth({
    baseURL: config.betterAuthUrl,
    secret: config.betterAuthSecret,
    basePath: '/api/auth',
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: true }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({ to: user.email, subject: 'Reset your Clautverse password', text: `Reset your password: ${url}\n\nIf you didn't ask for this, ignore this email.` })
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail({ to: user.email, subject: 'Confirm your Clautverse email', text: `Confirm your email: ${url}` })
      },
    },
    user: {
      additionalFields: {
        username: { type: 'string', required: true, input: true },
        dateOfBirth: { type: 'string', required: true, input: true, returned: false },
        displayName: { type: 'string', required: false, input: true },
        roles: { type: 'string', required: false, input: false, defaultValue: 'fan' },
        status: { type: 'string', required: false, input: false, defaultValue: 'active' },
        onboardingStatus: { type: 'string', required: false, input: false, defaultValue: 'not_started' },
      },
    },
    rateLimit: { enabled: config.authRateLimitEnabled !== false, storage: 'database', window: 60, max: 30 },
    databaseHooks: {
      user: {
        create: {
          before: async (input) => {
            const username = String(input.username ?? '').trim().toLowerCase()
            if (!USERNAME_RE.test(username) || RESERVED_USERNAMES.has(username))
              throw new APIError('BAD_REQUEST', { code: 'VALIDATION_FAILED', message: 'username must be 3-30 characters: a-z, 0-9 or _' })
            const dob = input.dateOfBirth
            if (!isValidIsoDate(dob))
              throw new APIError('BAD_REQUEST', { code: 'VALIDATION_FAILED', message: 'dateOfBirth must be YYYY-MM-DD' })
            if (ageOn(dob) < MINIMUM_AGE)
              throw new APIError('BAD_REQUEST', { code: 'UNDER_MINIMUM_AGE', message: `You must be ${MINIMUM_AGE} or older to join Clautverse.` })
            const [taken] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, username)).limit(1)
            if (taken) throw new APIError('BAD_REQUEST', { code: 'USERNAME_TAKEN', message: 'That username is taken.' })
            return { data: { ...input, username, roles: 'fan', status: 'active', onboardingStatus: 'not_started' } }
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const [u] = await db.select().from(schema.user).where(eq(schema.user.id, session.userId)).limit(1)
            if (!u) return false
            if (u.status === 'suspended') throw new APIError('FORBIDDEN', { code: 'ACCOUNT_SUSPENDED', message: 'This account is suspended.' })
            if (u.status === 'pending_deletion') {
              const cutoff = Date.now() - DELETION_GRACE_DAYS * 86_400_000
              if (!u.deletionRequestedAt || u.deletionRequestedAt.getTime() < cutoff) return false
              // Signing in during the grace period restores the account (decision 17).
              await db.update(schema.user).set({ status: 'active', deletionRequestedAt: null }).where(eq(schema.user.id, u.id))
            }
          },
        },
      },
    },
  })
}

let _auth: ReturnType<typeof createAuth> | undefined
export function useAuth() {
  _auth ??= createAuth()
  return _auth
}

export type DbUser = typeof schema.user.$inferSelect

export interface RequireUserOptions { verified?: boolean, onboarded?: boolean }

/** Loads the signed-in user or throws the right envelope error (review §1.5). */
export async function requireUser(event: H3Event, opts: RequireUserOptions = {}): Promise<DbUser> {
  const { verified = true, onboarded = false } = opts
  const session = await useAuth().api.getSession({ headers: event.headers })
  if (!session) throw apiError('UNAUTHENTICATED', 'Sign in to continue.')
  const [u] = await useDb().select().from(schema.user).where(eq(schema.user.id, session.user.id)).limit(1)
  if (!u || u.status === 'pending_deletion') throw apiError('UNAUTHENTICATED', 'Sign in to continue.')
  if (u.status === 'suspended') throw apiError('ACCOUNT_SUSPENDED', 'This account is suspended.')
  if (verified && !u.emailVerified) throw apiError('EMAIL_NOT_VERIFIED', 'Confirm your email address to continue.')
  if (onboarded && u.onboardingStatus !== 'completed') throw apiError('ONBOARDING_REQUIRED', 'Finish onboarding first.')
  event.context.user = u
  return u
}

export function userRoles(u: DbUser): string[] {
  return u.roles.split(',').filter(Boolean)
}

export function toMe(u: DbUser) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.image,
    email: u.email,
    emailVerified: u.emailVerified,
    roles: userRoles(u),
    status: u.status,
    onboardingStatus: u.onboardingStatus,
    createdAt: u.createdAt.toISOString(),
  }
}
