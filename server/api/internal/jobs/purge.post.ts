import { and, eq, lte, sql } from 'drizzle-orm'

// OPS-03 (daily): erase accounts 30 days after deletion was requested (decision 17).
// Deleting the user row removes personal data; FKs anonymise what must stay
// (XP ledger, drops, replies, reports → user id set null). Original positions stay retired.
export default defineEventHandler(async (event) => {
  requireCron(event)
  const db = useDb()
  const due = await db.select({ id: schema.user.id }).from(schema.user)
    .where(and(eq(schema.user.status, 'pending_deletion'), lte(schema.user.deletionRequestedAt, sql`now() - make_interval(days => ${DELETION_GRACE_DAYS})`))).limit(100)
  for (const { id } of due) {
    await db.transaction(async (tx) => {
      await tx.execute(sql`update community c set member_count = member_count - 1
        from membership m where m.community_id = c.id and m.user_id = ${id} and m.status = 'active'`)
      await tx.delete(schema.user).where(and(eq(schema.user.id, id), eq(schema.user.status, 'pending_deletion')))
    })
  }
  return { purged: due.length }
})
