CREATE TABLE "admin_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_talent_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"rules" text,
	"image_url" text,
	"status" text DEFAULT 'active' NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"originals_assigned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_owner_talent_id_unique" UNIQUE("owner_talent_id"),
	CONSTRAINT "community_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "identity_claim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"talent_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"evidence_links" text[] DEFAULT '{}' NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"decision_reason" text,
	"internal_note" text,
	"decided_by" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"community_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"alerts_enabled" boolean DEFAULT true NOT NULL,
	"lane" text,
	"original_position" integer,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	CONSTRAINT "membership_user_community_uq" UNIQUE("user_id","community_id"),
	CONSTRAINT "membership_original_position_uq" UNIQUE("community_id","original_position")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "talent_application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decision_reason" text,
	"internal_note" text,
	"talent_id" uuid,
	"decided_by" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "community" ADD CONSTRAINT "community_owner_talent_id_talent_id_fk" FOREIGN KEY ("owner_talent_id") REFERENCES "public"."talent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_claim" ADD CONSTRAINT "identity_claim_talent_id_talent_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity_claim" ADD CONSTRAINT "identity_claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_application" ADD CONSTRAINT "talent_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_application" ADD CONSTRAINT "talent_application_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_application" ADD CONSTRAINT "talent_application_talent_id_talent_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_created_idx" ON "admin_audit" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "admin_audit_target_idx" ON "admin_audit" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "community_popular_idx" ON "community" USING btree ("member_count","id");--> statement-breakpoint
CREATE UNIQUE INDEX "identity_claim_one_pending_uq" ON "identity_claim" USING btree ("user_id","talent_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "identity_claim_queue_idx" ON "identity_claim" USING btree ("status","submitted_at","id");--> statement-breakpoint
CREATE INDEX "notification_user_idx" ON "notification" USING btree ("user_id","created_at","id");--> statement-breakpoint
CREATE UNIQUE INDEX "talent_application_one_pending_uq" ON "talent_application" USING btree ("user_id") WHERE status = 'pending';--> statement-breakpoint
CREATE INDEX "talent_application_queue_idx" ON "talent_application" USING btree ("status","submitted_at","id");