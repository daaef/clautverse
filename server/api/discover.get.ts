import { and, desc, eq, inArray, notInArray } from 'drizzle-orm'

// DIS-01: for_you (signed in: fandoms of the Stars picked in onboarding, not joined),
// popular_communities, new_talents. ≤12 each; "see all" uses COM-01 / CAT-05.
export default defineEventHandler(async (event) => {
  const viewer = await optionalUser(event)
  const db = useDb()
  const cm = schema.community
  const joined = viewer
    ? (await db.select({ id: schema.membership.communityId }).from(schema.membership)
        .where(and(eq(schema.membership.userId, viewer.id), eq(schema.membership.status, 'active')))).map(r => r.id)
    : []
  const notJoined = joined.length ? notInArray(cm.id, joined) : undefined
  const sections = []
  if (viewer) {
    const [o] = await db.select().from(schema.onboarding).where(eq(schema.onboarding.userId, viewer.id)).limit(1)
    let items: ReturnType<typeof communityCard>[] = []
    if (o?.talentIds.length) {
      const rows = await db.select().from(cm).where(and(eq(cm.status, 'active'), notJoined, inArray(cm.ownerTalentId, o.talentIds)))
        .orderBy(desc(cm.memberCount), cm.id).limit(12)
      items = rows.map(c => communityCard(c, null))
    }
    sections.push({ key: 'for_you', title: 'For you', items })
  }
  const popular = await db.select().from(cm).where(and(eq(cm.status, 'active'), notJoined)).orderBy(desc(cm.memberCount), cm.id).limit(12)
  sections.push({ key: 'popular_communities', title: 'Popular communities', items: popular.map(c => communityCard(c, null)) })
  const fresh = await db.select({ t: schema.talent, communityId: cm.id }).from(schema.talent)
    .innerJoin(cm, and(eq(cm.ownerTalentId, schema.talent.id), eq(cm.status, 'active')))
    .orderBy(desc(schema.talent.createdAt), schema.talent.id).limit(12)
  sections.push({ key: 'new_talents', title: 'New talents', items: fresh.map(r => talentCard(r.t, r.communityId)) })
  return { sections }
})
