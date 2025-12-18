import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "../../config/env";
import * as schema from "./schema.js";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function initDb() {
    if (!dbInstance) {
        const env = getEnv();
        const client = postgres(env.POSTGRES_URL);
        dbInstance = drizzle(client, { schema });
    }
    return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get(_, prop) {
        const instance = initDb();
        return instance[prop as keyof typeof instance];
    },
});
