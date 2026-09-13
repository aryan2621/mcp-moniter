-- Drop FK so we can alter server_id and id columns
ALTER TABLE "api_keys" DROP CONSTRAINT IF EXISTS "api_keys_server_id_servers_id_fk";
--> statement-breakpoint
-- servers.id: uuid -> varchar(36)
ALTER TABLE "servers" ALTER COLUMN "id" SET DATA TYPE varchar(36) USING "id"::text;
ALTER TABLE "servers" ALTER COLUMN "id" SET DEFAULT (gen_random_uuid()::text);
--> statement-breakpoint
-- api_keys.server_id and id: uuid -> varchar(36)
ALTER TABLE "api_keys" ALTER COLUMN "server_id" SET DATA TYPE varchar(36) USING "server_id"::text;
--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "id" SET DATA TYPE varchar(36) USING "id"::text;
ALTER TABLE "api_keys" ALTER COLUMN "id" SET DEFAULT (gen_random_uuid()::text);
--> statement-breakpoint
-- Re-add FK
DO $$ BEGIN
 ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "servers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
