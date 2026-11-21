CREATE TABLE "block" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocker_id" text NOT NULL,
	"blocked_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "block_blocker_blocked_uq" UNIQUE("blocker_id","blocked_id")
);
--> statement-breakpoint
ALTER TABLE "membership" ADD COLUMN "removal_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "membership" ADD COLUMN "blocked_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blocker_id_user_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blocked_id_user_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;