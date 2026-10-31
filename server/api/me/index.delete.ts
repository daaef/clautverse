import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

// AUTH-08: schedule deletion with a 30-day grace period (decision 17).
const body = z.object({ password: z.string().min(1) }).strict()

export default defineEventHandler(async (event) => {
  const me = await requireUser(event, { verified: false })
  const { password } = await readJsonBody(event, body)
  await rateLimit(event, 'delete-me', me.id, 5, 3600)
  const db = useDb()
  const [cred] = await db.select({ password: schema.account.password }).from(schema.account)
    .where(and(eq(schema.account.userId, me.id), eq(schema.account.providerId, 'credential'))).limit(1)
  const ctx = await useAuth().$context
  if (!cred?.password || !(await ctx.password.verify({ hash: cred.password, password })))
    throw apiError('FORBIDDEN', 'Password is incorrect.')

  const requestedAt = new Date()
  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ status: 'pending_deletion', deletionRequestedAt: requestedAt }).where(eq(schema.user.id, me.id))
    await tx.delete(schema.session).where(eq(schema.session.userId, me.id))
  })
  deleteCookie(event, 'better-auth.session_token')
  deleteCookie(event, '__Secure-better-auth.session_token')
  setResponseStatus(event, 202)
  return { status: 'pending_deletion', purgeAt: new Date(requestedAt.getTime() + DELETION_GRACE_DAYS * 86_400_000).toISOString() }
})
