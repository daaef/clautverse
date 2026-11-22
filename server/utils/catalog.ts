import { eq, inArray } from 'drizzle-orm'

export const list = <T>(items: T[]) => ({ items, nextCursor: null as string | null })

const uniq = <T>(xs: T[]) => [...new Set(xs)]

export interface Selections { categoryId?: string | null, talentIds?: string[] }

/** Checks every picked ID exists and is selectable; throws VALIDATION_FAILED with per-field details. */
export async function validateSelections(sel: Selections) {
  const db = useDb()
  const fields: Record<string, string> = {}
  if (sel.categoryId) {
    const [c] = await db.select().from(schema.category).where(eq(schema.category.id, sel.categoryId))
    if (!c) fields.categoryId = 'unknown'
    else if (!c.active) fields.categoryId = 'inactive'
  }
  const talentIds = uniq(sel.talentIds ?? [])
  if (talentIds.length) {
    const rows = await db.select({ id: schema.talent.id, categoryId: schema.talent.categoryId }).from(schema.talent).where(inArray(schema.talent.id, talentIds))
    const byId = new Map(rows.map(r => [r.id, r]))
    talentIds.forEach((id, i) => {
      const t = byId.get(id)
      if (!t) fields[`talentIds[${i}]`] = 'unknown'
      else if (sel.categoryId && t.categoryId !== sel.categoryId) fields[`talentIds[${i}]`] = 'not_in_category'
    })
  }
  if (Object.keys(fields).length) throw apiError('VALIDATION_FAILED', 'Some selections are invalid.', { fields })
  return { categoryId: sel.categoryId ?? null, talentIds }
}
