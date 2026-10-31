import { sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid, unique, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth'

// Fixed-window counters for Clautverse's own routes (decision: rate limits in Postgres).
export const apiRateLimit = pgTable('api_rate_limit', {
  key: text('key').primaryKey(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  count: integer('count').notNull(),
})

export const category = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const country = pgTable('country', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // ISO 3166-1 alpha-2
  name: text('name').notNull(),
})

export const show = pgTable('show', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => category.id),
  countryId: uuid('country_id').notNull().references(() => country.id),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
}, t => [index('show_category_country_idx').on(t.categoryId, t.countryId)])

export const season = pgTable('season', {
  id: uuid('id').primaryKey().defaultRandom(),
  showId: uuid('show_id').notNull().references(() => show.id),
  number: integer('number').notNull(),
  name: text('name').notNull(),
  year: integer('year'),
}, t => [unique('season_show_number_uq').on(t.showId, t.number)])

export const talent = pgTable('talent', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  userId: text('user_id').unique().references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const seasonTalent = pgTable('season_talent', {
  seasonId: uuid('season_id').notNull().references(() => season.id),
  talentId: uuid('talent_id').notNull().references(() => talent.id),
}, t => [primaryKey({ columns: [t.seasonId, t.talentId] })])

// One row per user; holds resumable onboarding picks (ONB-01..03).
export const onboarding = pgTable('onboarding', {
  userId: text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => category.id),
  countryId: uuid('country_id').references(() => country.id),
  showIds: uuid('show_ids').array().notNull().default([]),
  seasonIds: uuid('season_ids').array().notNull().default([]),
  talentIds: uuid('talent_ids').array().notNull().default([]),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Link = { label: string, url: string }

// Decision 14: one talent owns one community (unique owner_talent_id).
export const community = pgTable('community', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerTalentId: uuid('owner_talent_id').unique().references(() => talent.id),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  rules: text('rules'),
  imageUrl: text('image_url'),
  status: text('status', { enum: ['active', 'vetoed'] }).notNull().default('active'),
  memberCount: integer('member_count').notNull().default(0),
  // Row-locked counter: positions 1..100 are handed out once and never reused (decision 6).
  originalsAssigned: integer('originals_assigned').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('community_popular_idx').on(t.memberCount, t.id)])

export const membership = pgTable('membership', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  communityId: uuid('community_id').notNull().references(() => community.id),
  status: text('status', { enum: ['active', 'left', 'removed'] }).notNull().default('active'),
  alertsEnabled: boolean('alerts_enabled').notNull().default(true),
  lane: text('lane'), // reserved: lanes not defined yet
  originalPosition: integer('original_position'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  leftAt: timestamp('left_at', { withTimezone: true }),
}, t => [
  unique('membership_user_community_uq').on(t.userId, t.communityId),
  unique('membership_original_position_uq').on(t.communityId, t.originalPosition),
])

export const talentApplication = pgTable('talent_application', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => category.id),
  displayName: text('display_name').notNull(),
  bio: text('bio').notNull().default(''),
  links: jsonb('links').$type<Link[]>().notNull().default([]),
  status: text('status', { enum: ['pending', 'accepted', 'declined'] }).notNull().default('pending'),
  decisionReason: text('decision_reason'),
  internalNote: text('internal_note'),
  talentId: uuid('talent_id').references(() => talent.id),
  decidedBy: text('decided_by'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
}, t => [
  uniqueIndex('talent_application_one_pending_uq').on(t.userId).where(sql`status = 'pending'`),
  index('talent_application_queue_idx').on(t.status, t.submittedAt, t.id),
])

export const identityClaim = pgTable('identity_claim', {
  id: uuid('id').primaryKey().defaultRandom(),
  talentId: uuid('talent_id').notNull().references(() => talent.id),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  evidenceLinks: text('evidence_links').array().notNull().default([]),
  message: text('message'),
  status: text('status', { enum: ['pending', 'verified', 'rejected'] }).notNull().default('pending'),
  decisionReason: text('decision_reason'),
  internalNote: text('internal_note'),
  decidedBy: text('decided_by'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
}, t => [
  uniqueIndex('identity_claim_one_pending_uq').on(t.userId, t.talentId).where(sql`status = 'pending'`),
  index('identity_claim_queue_idx').on(t.status, t.submittedAt, t.id),
])

// Append-only: the app never updates or deletes audit rows. actor_id is kept as plain text so
// rows survive account erasure (decision 17).
export const adminAudit = pgTable('admin_audit', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: text('actor_id').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('admin_audit_created_idx').on(t.createdAt, t.id), index('admin_audit_target_idx').on(t.targetType, t.targetId)])

export const notification = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('notification_user_idx').on(t.userId, t.createdAt, t.id)])

// Decisions 7–9: talents post; audience public | members (default) | originals_only.
// A drop is live when status is published/scheduled and publish_at <= now() (no job needed).
export const drop = pgTable('drop', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => community.id),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['text', 'voice', 'image'] }).notNull(),
  body: text('body'),
  teaser: text('teaser'),
  audience: text('audience', { enum: ['public', 'members', 'originals_only'] }).notNull().default('members'),
  status: text('status', { enum: ['draft', 'scheduled', 'published', 'archived', 'removed'] }).notNull().default('draft'),
  publishAt: timestamp('publish_at', { withTimezone: true }),
  likeCount: integer('like_count').notNull().default(0),
  replyCount: integer('reply_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
}, t => [index('drop_timeline_idx').on(t.communityId, t.publishAt, t.id)])

export const dropReaction = pgTable('drop_reaction', {
  dropId: uuid('drop_id').notNull().references(() => drop.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['like'] }).notNull().default('like'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.dropId, t.userId] })])

export const reply = pgTable('reply', {
  id: uuid('id').primaryKey().defaultRandom(),
  dropId: uuid('drop_id').notNull().references(() => drop.id, { onDelete: 'cascade' }),
  authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
  parentReplyId: uuid('parent_reply_id'),
  body: text('body').notNull(),
  status: text('status', { enum: ['active', 'deleted', 'removed'] }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp('edited_at', { withTimezone: true }),
}, t => [index('reply_drop_idx').on(t.dropId, t.createdAt, t.id)])

// Optional Idempotency-Key header: replaying the same key returns the original resource.
export const idempotencyKey = pgTable('idempotency_key', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  scope: text('scope').notNull(),
  key: text('key').notNull(),
  resourceId: text('resource_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.userId, t.scope, t.key] })])

// RPT-01 / ADM-12..13: reporters are never revealed to the reported user.
export const report = pgTable('report', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: text('reporter_id').references(() => user.id, { onDelete: 'set null' }),
  targetType: text('target_type', { enum: ['drop', 'reply', 'user', 'community', 'mission'] }).notNull(),
  targetId: text('target_id').notNull(),
  reason: text('reason', { enum: ['spam', 'harassment', 'hate', 'sexual', 'impersonation', 'other'] }).notNull(),
  details: text('details'),
  status: text('status', { enum: ['open', 'actioned', 'dismissed'] }).notNull().default('open'),
  action: text('action'),
  internalNote: text('internal_note'),
  decidedBy: text('decided_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
}, t => [
  uniqueIndex('report_one_open_uq').on(t.reporterId, t.targetType, t.targetId).where(sql`status = 'open'`),
  index('report_queue_idx').on(t.status, t.createdAt, t.id),
])

// Admin-configurable settings, e.g. xp_rules = { missionXpMin, missionXpMax } (decision 11).
export const appSetting = pgTable('app_setting', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Decision 10: talent picks auto-approve or owner review per mission; one completion per fan.
export const mission = pgTable('mission', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => community.id),
  creatorId: text('creator_id').references(() => user.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  xpReward: integer('xp_reward').notNull(),
  deadline: timestamp('deadline', { withTimezone: true }),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'closed'] }).notNull().default('approved'),
  review: text('review', { enum: ['auto', 'owner'] }).notNull(),
  proof: text('proof', { enum: ['none', 'link', 'text'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('mission_community_idx').on(t.communityId, t.deadline, t.id)])

export const missionCompletion = pgTable('mission_completion', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id').notNull().references(() => mission.id),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['submitted', 'approved', 'rejected'] }).notNull(),
  proofLink: text('proof_link'),
  proofText: text('proof_text'),
  rejectionReason: text('rejection_reason'),
  xpTransactionId: uuid('xp_transaction_id'),
  reviewedBy: text('reviewed_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
}, t => [
  unique('mission_completion_once_uq').on(t.missionId, t.userId),
  index('mission_completion_queue_idx').on(t.missionId, t.status, t.createdAt, t.id),
])

// Append-only XP ledger. Balance = SUM(amount). The unique key makes grants idempotent.
// user_id is nulled (anonymised) on account erasure; rows are never edited or deleted.
export const xpTransaction = pgTable('xp_transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  amount: integer('amount').notNull(),
  sourceType: text('source_type', { enum: ['mission_completion', 'admin_adjustment'] }).notNull(),
  sourceId: text('source_id').notNull(),
  actorId: text('actor_id'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [
  unique('xp_transaction_source_uq').on(t.userId, t.sourceType, t.sourceId),
  index('xp_transaction_user_idx').on(t.userId, t.createdAt, t.id),
])

export const badge = pgTable('badge', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  iconUrl: text('icon_url'),
  communityId: uuid('community_id').references(() => community.id),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const badgeAward = pgTable('badge_award', {
  badgeId: uuid('badge_id').notNull().references(() => badge.id),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  awardedBy: text('awarded_by'),
  awardedAt: timestamp('awarded_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [primaryKey({ columns: [t.badgeId, t.userId] }), index('badge_award_user_idx').on(t.userId, t.awardedAt)])
