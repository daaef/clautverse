import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { z } from 'zod'

// ADM-10: search users; createdAt desc.
const query = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  status: z.enum(['active', 'suspended', 'pending_deletion']).optional(),
  role: z.enum(['fan', 'talent', 'super_admin']).optional(),
  ...pageQuery,
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { q, status, role, limit, cursor } = readQuery(event, query)
  const scope = `admin-users-${q ?? ''}-${status ?? ''}-${role ?? ''}`
  const cur = readCursor<{ t: string, id: string }>(cursor, scope)
  const u = schema.user
  const like = q ? `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%` : null
  const rows = await useDb().select().from(u).where(and(
    like ? or(ilike(u.email, like), ilike(u.username, like), ilike(u.displayName, like)) : undefined,
    status ? eq(u.status, status) : undefined,
    role ? sql`${role} = any(string_to_array(${u.roles}, ','))` : undefined,
    cur ? sql`(${u.createdAt}, ${u.id}) < (${cur.t}::timestamptz, ${cur.id})` : undefined,
  )).orderBy(desc(u.createdAt), desc(u.id)).limit(limit + 1)
  return toPage(rows, limit, scope, r => ({ t: r.createdAt.toISOString(), id: r.id }), adminUserView)
})
