import { and, eq, inArray } from 'drizzle-orm'

export const list = <T>(items: T[]) => ({ items, nextCursor: null as string | null })

const uniq = <T>(xs: T[]) => [...new Set(xs)]

export interface Selections { categoryId?: string | null, countryId?: string | null, showIds?: string[], seasonIds?: string[], talentIds?: string[] }

/** Checks every picked ID exists and is selectable; throws VALIDATION_FAILED with per-field details. */
export async function validateSelections(sel: Selections) {
  const db = useDb()
  const fields: Record<string, string> = {}
  if (sel.categoryId) {
    const [c] = await db.select().from(schema.category).where(eq(schema.category.id, sel.categoryId))
    if (!c) fields.categoryId = 'unknown'
    else if (!c.active) fields.categoryId = 'inactive'
  }
  if (sel.countryId) {
    const [c] = await db.select().from(schema.country).where(eq(schema.country.id, sel.countryId))
    if (!c) fields.countryId = 'unknown'
  }
  const showIds = uniq(sel.showIds ?? [])
  if (showIds.length) {
    const rows = await db.select().from(schema.show).where(inArray(schema.show.id, showIds))
    const byId = new Map(rows.map(r => [r.id, r]))
    showIds.forEach((id, i) => {
      const s = byId.get(id)
      if (!s) fields[`showIds[${i}]`] = 'unknown'
      else if (!s.active) fields[`showIds[${i}]`] = 'inactive'
      else if (sel.categoryId && s.categoryId !== sel.categoryId) fields[`showIds[${i}]`] = 'not_in_category'
    })
  }
  const seasonIds = uniq(sel.seasonIds ?? [])
  if (seasonIds.length) {
    const rows = await db.select().from(schema.season).where(inArray(schema.season.id, seasonIds))
    const byId = new Map(rows.map(r => [r.id, r]))
    seasonIds.forEach((id, i) => {
      const s = byId.get(id)
      if (!s) fields[`seasonIds[${i}]`] = 'unknown'
      else if (!showIds.includes(s.showId)) fields[`seasonIds[${i}]`] = 'not_in_selected_shows'
    })
  }
  const talentIds = uniq(sel.talentIds ?? [])
  if (talentIds.length) {
    const rows = await db.select({ id: schema.talent.id }).from(schema.talent).where(inArray(schema.talent.id, talentIds))
    const known = new Set(rows.map(r => r.id))
    talentIds.forEach((id, i) => { if (!known.has(id)) fields[`talentIds[${i}]`] = 'unknown' })
  }
  if (Object.keys(fields).length) throw apiError('VALIDATION_FAILED', 'Some selections are invalid.', { fields })
  return { categoryId: sel.categoryId ?? null, countryId: sel.countryId ?? null, showIds, seasonIds, talentIds }
}

export async function activeShowFilter(categoryId?: string, countryId?: string) {
  const conds = [eq(schema.show.active, true)]
  if (categoryId) conds.push(eq(schema.show.categoryId, categoryId))
  if (countryId) conds.push(eq(schema.show.countryId, countryId))
  return and(...conds)
}
