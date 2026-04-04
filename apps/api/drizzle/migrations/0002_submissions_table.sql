CREATE TYPE "public"."submission_status" AS ENUM('queued', 'submitting', 'submitted', 'verified', 'failed', 'requires_action', 'removed');

CREATE TABLE IF NOT EXISTS "submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "business_id" uuid NOT NULL REFERENCES "businesses"("id"),
  "directory_id" uuid NOT NULL REFERENCES "directories"("id"),
  "status" "submission_status" NOT NULL DEFAULT 'queued',
  "external_id" varchar(255),
  "error_code" varchar(100),
  "message" text,
  "submitted_at" timestamp with time zone,
  "verified_at" timestamp with time zone,
  "last_attempt" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);
