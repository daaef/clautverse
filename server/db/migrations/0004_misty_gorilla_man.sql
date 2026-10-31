CREATE TABLE "app_setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon_url" text,
	"community_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badge_award" (
	"badge_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"awarded_by" text,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badge_award_badge_id_user_id_pk" PRIMARY KEY("badge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "mission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"creator_id" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"xp_reward" integer NOT NULL,
	"deadline" timestamp with time zone,
	"status" text DEFAULT 'approved' NOT NULL,
	"review" text NOT NULL,
	"proof" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_completion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"proof_link" text,
	"proof_text" text,
	"rejection_reason" text,
	"xp_transaction_id" uuid,
	"reviewed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "mission_completion_once_uq" UNIQUE("mission_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "xp_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"amount" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"actor_id" text,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "xp_transaction_source_uq" UNIQUE("user_id","source_type","source_id")
);
--> statement-breakpoint
ALTER TABLE "badge" ADD CONSTRAINT "badge_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_badge_id_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission" ADD CONSTRAINT "mission_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission" ADD CONSTRAINT "mission_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_completion" ADD CONSTRAINT "mission_completion_mission_id_mission_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."mission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_completion" ADD CONSTRAINT "mission_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transaction" ADD CONSTRAINT "xp_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "badge_award_user_idx" ON "badge_award" USING btree ("user_id","awarded_at");--> statement-breakpoint
CREATE INDEX "mission_community_idx" ON "mission" USING btree ("community_id","deadline","id");--> statement-breakpoint
CREATE INDEX "mission_completion_queue_idx" ON "mission_completion" USING btree ("mission_id","status","created_at","id");--> statement-breakpoint
CREATE INDEX "xp_transaction_user_idx" ON "xp_transaction" USING btree ("user_id","created_at","id");