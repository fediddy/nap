DO $$ BEGIN
 CREATE TYPE "public"."batch_status" AS ENUM('imported', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"csv_filename" varchar(255) NOT NULL,
	"import_date" timestamp with time zone DEFAULT now() NOT NULL,
	"business_count" integer DEFAULT 0 NOT NULL,
	"status" "batch_status" DEFAULT 'imported' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
