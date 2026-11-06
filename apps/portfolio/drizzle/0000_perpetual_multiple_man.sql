CREATE TYPE "public"."access_level" AS ENUM('public', 'unlocked', 'admin');--> statement-breakpoint
CREATE TYPE "public"."grant_source" AS ENUM('manual', 'request', 'purchase');--> statement-breakpoint
CREATE TYPE "public"."grant_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'declined', 'approved');--> statement-breakpoint
CREATE TABLE "access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"product_slug" text NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"product_slug" text NOT NULL,
	"status" "grant_status" DEFAULT 'active' NOT NULL,
	"source" "grant_source" DEFAULT 'manual' NOT NULL,
	"expires_at" timestamp with time zone,
	"last_visit_at" timestamp with time zone,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grants_guest_id_product_slug_unique" UNIQUE("guest_id","product_slug")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"note" text DEFAULT '' NOT NULL,
	"password_lookup" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_email_unique" UNIQUE("email"),
	CONSTRAINT "guests_password_lookup_unique" UNIQUE("password_lookup")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"key" text PRIMARY KEY NOT NULL,
	"failures" integer NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"slug" text PRIMARY KEY NOT NULL,
	"kind" text DEFAULT 'project' NOT NULL,
	"level" "access_level" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grants" ADD CONSTRAINT "grants_product_slug_products_slug_fk" FOREIGN KEY ("product_slug") REFERENCES "public"."products"("slug") ON DELETE cascade ON UPDATE no action;