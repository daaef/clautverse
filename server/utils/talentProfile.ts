type Talent = typeof schema.talent.$inferSelect

export const talentView = (t: Talent) => ({
  id: t.id, slug: t.slug, name: t.name, knownFor: t.knownFor, categoryId: t.categoryId, countryId: t.countryId, bio: t.bio, links: t.links, imageUrl: t.imageUrl, isClaimed: !!t.userId, createdAt: t.createdAt.toISOString(),
})
export const talentCard = (t: Talent, communityId: string | null) => ({ id: t.id, slug: t.slug, name: t.name, knownFor: t.knownFor, imageUrl: t.imageUrl, communityId })
