-- Plan decision 2: Stars carry their own category, country and "known for" line; shows and seasons go.
-- 1. New Star columns (nullable until filled in).
ALTER TABLE "talent" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "talent" ADD COLUMN "country_id" uuid;--> statement-breakpoint
ALTER TABLE "talent" ADD COLUMN "known_for" text;--> statement-breakpoint
-- 2. Copy what the show/season links knew onto each Star before those tables are dropped.
UPDATE "talent" t SET
  "category_id" = x.category_id,
  "country_id" = x.country_id,
  "known_for" = x.known_for
FROM (
  SELECT st.talent_id,
    (array_agg(sh.category_id ORDER BY se.year DESC NULLS LAST))[1] AS category_id,
    (array_agg(sh.country_id ORDER BY se.year DESC NULLS LAST))[1] AS country_id,
    left(string_agg(sh.name || ', Season ' || se.number || coalesce(' · ' || se.year, ''), '; ' ORDER BY se.year DESC NULLS LAST), 80) AS known_for
  FROM "season_talent" st
  JOIN "season" se ON se.id = st.season_id
  JOIN "show" sh ON sh.id = se.show_id
  GROUP BY st.talent_id
) x
WHERE t.id = x.talent_id;--> statement-breakpoint
-- Stars with no show link fall back to Reality TV (the launch category), else the first category.
UPDATE "talent" SET "category_id" = coalesce(
  (SELECT id FROM "category" WHERE slug = 'reality-tv'),
  (SELECT id FROM "category" ORDER BY sort_order, id LIMIT 1)
) WHERE "category_id" IS NULL;--> statement-breakpoint
ALTER TABLE "talent" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "talent" ADD CONSTRAINT "talent_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent" ADD CONSTRAINT "talent_country_id_country_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."country"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- 3. Fan onboarding keeps category + favourite Stars only (decision 3: no country for fans).
ALTER TABLE "onboarding" DROP CONSTRAINT "onboarding_country_id_country_id_fk";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "country_id";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "show_ids";--> statement-breakpoint
ALTER TABLE "onboarding" DROP COLUMN "season_ids";--> statement-breakpoint
-- 4. Remove shows and seasons.
DROP TABLE "season_talent";--> statement-breakpoint
DROP TABLE "season";--> statement-breakpoint
DROP TABLE "show";
