import type { H3Event } from 'h3'
import { eq, sql } from 'drizzle-orm'

export type Tx = Parameters<Parameters<ReturnType<typeof useDb>['transaction']>[0]>[0]
export type DbOrTx = ReturnType<typeof useDb> | Tx

export const SUPER_ADMIN = 'super_admin'

export async function requireAdmin(event: H3Event) {
  const u = await requireUser(event)
  if (!userRoles(u).includes(SUPER_ADMIN)) throw apiError('FORBIDDEN', 'Admins only.')
  return u
}

export async function grantRole(tx: DbOrTx, userId: string, role: string) {
  await tx.update(schema.user).set({
    roles: sql`case when (',' || ${schema.user.roles} || ',') like ${`%,${role},%`} then ${schema.user.roles} else ${schema.user.roles} || ${`,${role}`} end`,
  }).where(eq(schema.user.id, userId))
}

export async function audit(tx: DbOrTx, actorId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  await tx.insert(schema.adminAudit).values({ actorId, action, targetType, targetId, metadata })
}

export async function notify(tx: DbOrTx, userId: string, type: string, data: Record<string, unknown> = {}) {
  await tx.insert(schema.notification).values({ userId, type, data })
}

export function slugify(name: string) {
  return name.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 50) || 'talent'
}

/** First free slug among `base`, `base-2`, `base-3`… for the given table. */
export async function uniqueSlug(tx: DbOrTx, table: typeof schema.talent | typeof schema.community, base: string) {
  const taken = new Set((await tx.select({ slug: table.slug }).from(table).where(sql`${table.slug} = ${base} or ${table.slug} like ${`${base}-%`}`)).map(r => r.slug))
  if (!taken.has(base)) return base
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`
}

/** Decision 14: accepting an application or claim auto-creates the talent's single community. */
export async function ensureTalentCommunity(tx: DbOrTx, talentRow: typeof schema.talent.$inferSelect) {
  const [existing] = await tx.select().from(schema.community).where(eq(schema.community.ownerTalentId, talentRow.id)).limit(1)
  if (existing) return existing
  const [created] = await tx.insert(schema.community).values({
    ownerTalentId: talentRow.id,
    slug: await uniqueSlug(tx, schema.community, talentRow.slug),
    name: talentRow.name,
    imageUrl: talentRow.imageUrl,
  }).returning()
  return created!
}

export const publicUser = (u: Pick<typeof schema.user.$inferSelect, 'id' | 'username' | 'displayName' | 'image'>) =>
  ({ id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.image })
