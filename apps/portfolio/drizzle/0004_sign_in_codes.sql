ALTER TABLE "guests" ADD COLUMN "sign_in_code_hash" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "sign_in_code_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "sign_in_code_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "sign_in_code_sent_at" timestamp with time zone;