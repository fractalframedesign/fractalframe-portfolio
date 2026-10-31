ALTER TABLE "guests" ADD COLUMN "access_status" "grant_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "access_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "last_visit_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "visit_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- carry-over
-- Each guest keeps the access their per-project grants gave them.
UPDATE "guests" AS g
SET
  "access_status" = c.status::"grant_status",
  "access_expires_at" = c.expires,
  "last_visit_at" = c.last_visit,
  "visit_count" = c.visits
FROM (
  SELECT
    "guest_id",
    CASE
      WHEN bool_or("status" = 'active' AND ("expires_at" IS NULL OR "expires_at" > now())) THEN 'active'
      WHEN bool_or("status" = 'paused' AND ("expires_at" IS NULL OR "expires_at" > now())) THEN 'paused'
      ELSE 'active'
    END AS status,
    CASE
      WHEN bool_or("status" = 'active' AND ("expires_at" IS NULL OR "expires_at" > now())) THEN
        CASE WHEN bool_or("status" = 'active' AND "expires_at" IS NULL) THEN NULL
          ELSE max("expires_at") FILTER (WHERE "status" = 'active' AND "expires_at" > now()) END
      WHEN bool_or("status" = 'paused' AND ("expires_at" IS NULL OR "expires_at" > now())) THEN
        CASE WHEN bool_or("status" = 'paused' AND "expires_at" IS NULL) THEN NULL
          ELSE max("expires_at") FILTER (WHERE "status" = 'paused' AND "expires_at" > now()) END
      ELSE max("expires_at")
    END AS expires,
    max("last_visit_at") AS last_visit,
    sum("visit_count")::int AS visits
  FROM "grants"
  GROUP BY "guest_id"
) AS c
WHERE g."id" = c."guest_id";
--> statement-breakpoint
UPDATE "guests" SET "access_status" = 'paused'
WHERE "id" NOT IN (SELECT "guest_id" FROM "grants");
