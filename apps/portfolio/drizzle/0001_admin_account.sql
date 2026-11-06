CREATE TABLE "admin_account" (
	"id" text PRIMARY KEY DEFAULT 'owner' NOT NULL,
	"password_hash" text NOT NULL,
	"password_changed_at" timestamp with time zone NOT NULL
);
