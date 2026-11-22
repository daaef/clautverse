// ADM-11
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readUserIdParam(event)
  const input = await readJsonBody(event, adminActionBody)
  return adminUserView(await useDb().transaction(tx => suspendUser(tx, admin, id, input)))
})
