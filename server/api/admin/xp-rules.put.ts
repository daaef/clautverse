import { getXpRules } from '../../utils/missions'
import { z } from 'zod'

// ADM-15: the range talents choose mission XP rewards from.
const body = z.object({ missionXpMin: z.number().int().min(1).max(100_000), missionXpMax: z.number().int().min(1).max(100_000) }).strict()
  .refine(v => v.missionXpMin <= v.missionXpMax, { message: 'min must not exceed max', path: ['missionXpMin'] })

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const value = await readJsonBody(event, body)
  await useDb().transaction(async (tx) => {
    const before = await getXpRules(tx)
    await tx.insert(schema.appSetting).values({ key: 'xp_rules', value, updatedBy: admin.id })
      .onConflictDoUpdate({ target: schema.appSetting.key, set: { value, updatedBy: admin.id, updatedAt: new Date() } })
    await audit(tx, admin.id, 'xp_rules.updated', 'setting', 'xp_rules', { before, after: value })
  })
  return value
})
