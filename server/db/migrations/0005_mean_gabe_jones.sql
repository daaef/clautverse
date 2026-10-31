CREATE TABLE "watch_party" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"host_id" text,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"time_zone" text NOT NULL,
	"link" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"rsvp_count" integer DEFAULT 0 NOT NULL,
	"reminder_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watch_party_rsvp" (
	"party_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_party_rsvp_party_id_user_id_pk" PRIMARY KEY("party_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "watch_party" ADD CONSTRAINT "watch_party_community_id_community_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."community"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_party" ADD CONSTRAINT "watch_party_host_id_user_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_party_rsvp" ADD CONSTRAINT "watch_party_rsvp_party_id_watch_party_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."watch_party"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watch_party_rsvp" ADD CONSTRAINT "watch_party_rsvp_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "watch_party_start_idx" ON "watch_party" USING btree ("starts_at","id");--> statement-breakpoint
CREATE INDEX "watch_party_community_idx" ON "watch_party" USING btree ("community_id","starts_at");