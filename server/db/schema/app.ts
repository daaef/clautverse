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
