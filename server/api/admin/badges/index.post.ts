// ADM-16
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = await readJsonBody(event, badgeBody)
  if (input.communityId) await loadVisibleCommunity(input.communityId, admin)
  const row = await useDb().transaction(async (tx) => {
    const [b] = await tx.insert(schema.badge).values(input).returning()
    await audit(tx, admin.id, 'badge.created', 'badge', b!.id, { name: b!.name })
    return b!
  })
  setResponseStatus(event, 201)
  return badgeView(row)
})
