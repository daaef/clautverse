import { eq } from 'drizzle-orm'

// ADM-04: role + talent + community + audit + notification in one transaction.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = readIdParam(event)
  const { internalNote } = await readJsonBody(event, decisionBody)
  const t = schema.talentApplication
  return useDb().transaction(async (tx) => {
    const [app] = await tx.select().from(t).where(eq(t.id, id)).for('update').limit(1)
    if (!app) throw apiError('NOT_FOUND', 'Application not found.')
    if (app.status === 'accepted') return adminApplicationView(app)
    if (app.status === 'declined') throw apiError('INVALID_STATE', 'This application was already declined.')
    const [existing] = await tx.select().from(schema.talent).where(eq(schema.talent.userId, app.userId)).limit(1)
    const tal = existing ?? (await tx.insert(schema.talent).values({
      slug: await uniqueSlug(tx, schema.talent, slugify(app.displayName)),
      name: app.displayName,
      bio: app.bio || null,
      userId: app.userId,
    }).returning())[0]!
    const comm = await ensureTalentCommunity(tx, tal)
    await grantRole(tx, app.userId, 'talent')
    const [row] = await tx.update(t).set({ status: 'accepted', decidedAt: new Date(), decidedBy: admin.id, internalNote: internalNote ?? null, talentId: tal.id })
      .where(eq(t.id, id)).returning()
    await audit(tx, admin.id, 'application.accepted', 'talent_application', id, { talentId: tal.id, communityId: comm.id })
    await notify(tx, app.userId, 'talent_application.accepted', { applicationId: id, talentId: tal.id, communityId: comm.id })
    return adminApplicationView(row!)
  })
})
