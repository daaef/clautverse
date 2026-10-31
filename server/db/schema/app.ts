import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uuid, unique } from 'drizzle-orm/pg-core'
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
