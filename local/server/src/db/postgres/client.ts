import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import type { Env } from "../../config/env";
import * as schema from "./schema";
import { Logger } from "../../utils/logger";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

const logger = new Logger("Postgres");

let sqlClient: ReturnType<typeof postgres> | null = null;
let db: Db | null = null;

export function getDb(env: Env): Db {
    if (!db) {
        sqlClient = postgres(env.POSTGRES_URL, { max: 10 });
        db = drizzle(sqlClient, { schema });
        logger.info("Initialized Postgres client");
    }
    return db;
}

export async function ensureSchema(database: Db): Promise<void> {
    await database.execute(sql`
        CREATE TABLE IF NOT EXISTS servers (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            last_seen_at TIMESTAMP
        )
    `);

    await database.execute(sql`
        CREATE TABLE IF NOT EXISTS tool_calls (
            id VARCHAR(36) PRIMARY KEY,
            server_id VARCHAR(36) NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
            call_id VARCHAR(255) NOT NULL,
            tool_name VARCHAR(255) NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            duration DOUBLE PRECISION NOT NULL,
            input_size INTEGER NOT NULL,
            output_size INTEGER,
            success BOOLEAN NOT NULL,
            error TEXT,
            error_stack TEXT
        )
    `);

    await database.execute(sql`
        CREATE INDEX IF NOT EXISTS tool_calls_server_time_idx
        ON tool_calls (server_id, timestamp DESC)
    `);

    await database.execute(sql`
        CREATE INDEX IF NOT EXISTS tool_calls_server_tool_idx
        ON tool_calls (server_id, tool_name)
    `);

    await database.execute(sql`
        DELETE FROM tool_calls a
        USING tool_calls b
        WHERE a.ctid < b.ctid
          AND a.server_id = b.server_id
          AND a.call_id = b.call_id
    `);

    await database.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS tool_calls_server_call_idx
        ON tool_calls (server_id, call_id)
    `);

    await database.execute(sql`
        CREATE TABLE IF NOT EXISTS instance_settings (
            id VARCHAR(36) PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            logo_data_url TEXT,
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    `);

    await database.execute(sql`
        ALTER TABLE instance_settings
        ADD COLUMN IF NOT EXISTS company_description TEXT
    `);

    await database.execute(sql`
        ALTER TABLE instance_settings
        ADD COLUMN IF NOT EXISTS logo_size VARCHAR(8)
    `);

    await database.execute(sql`
        CREATE TABLE IF NOT EXISTS rate_limit_hits (
            key VARCHAR(255) PRIMARY KEY,
            count INTEGER NOT NULL,
            reset_at TIMESTAMP NOT NULL
        )
    `);

    logger.info("Schema ready");
}

export async function closeDb(): Promise<void> {
    if (sqlClient) {
        await sqlClient.end();
        sqlClient = null;
        db = null;
    }
}
