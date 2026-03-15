import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Env } from "../../config/env";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

/**
 * Creates a request-scoped Drizzle DB instance. Must be called per request
 * on Cloudflare Workers (I/O cannot be shared across requests).
 */
export function createDb(env: Env) {
    const client = postgres(env.POSTGRES_URL);
    return drizzle(client, { schema });
}
