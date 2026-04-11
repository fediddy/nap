-- Directory accounts table for multi-session browser auth
DO $$ BEGIN
  CREATE TYPE "public"."directory_account_status" AS ENUM('active', 'needs_reauth', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "directory_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(100) NOT NULL,
  "label" varchar(255) NOT NULL,
  "cookies_json" text,
  "user_agent" text,
  "status" "directory_account_status" DEFAULT 'active' NOT NULL,
  "pages_created" integer DEFAULT 0 NOT NULL,
  "last_used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "directory_accounts_slug_idx" ON "directory_accounts" ("slug");
