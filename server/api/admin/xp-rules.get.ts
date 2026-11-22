import { getXpRules } from '../../utils/missions'
// ADM-15
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return getXpRules()
})
