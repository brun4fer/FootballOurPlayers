CREATE TABLE "public_reports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"filters" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "public_reports_created_at_idx" ON "public_reports" USING btree ("created_at");
