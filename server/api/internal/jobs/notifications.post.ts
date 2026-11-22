import { sql } from 'drizzle-orm'

// OPS-02 (every ~5–15 min): watch-party status ticks + 1-hour reminders to RSVP'd fans. Idempotent.
export default defineEventHandler(async (event) => {
  requireCron(event)
  return useDb().transaction(async (tx) => {
    const reminded = await tx.execute(sql`
      with due as (
        update watch_party set reminder_sent_at = now()
        where status = 'scheduled' and reminder_sent_at is null and starts_at <= now() + interval '1 hour' and starts_at > now()
        returning id)
      insert into notification (user_id, type, data)
      select r.user_id, 'watch_party.reminder', jsonb_build_object('partyId', r.party_id::text)
      from watch_party_rsvp r join due on due.id = r.party_id
      returning id`)
    const live = await tx.execute(sql`update watch_party set status = 'live'
      where status = 'scheduled' and starts_at <= now() and coalesce(ends_at, starts_at + interval '3 hours') > now() returning id`)
    const ended = await tx.execute(sql`update watch_party set status = 'ended'
      where status in ('scheduled', 'live') and coalesce(ends_at, starts_at + interval '3 hours') <= now() returning id`)
    return { reminders: reminded.length, live: live.length, ended: ended.length }
  })
})
