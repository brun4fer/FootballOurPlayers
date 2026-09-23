ALTER TABLE "workspaces" ADD COLUMN "admin_password_hash" text;
ALTER TABLE "workspaces" ADD COLUMN "admin_must_change_password" boolean DEFAULT false NOT NULL;
