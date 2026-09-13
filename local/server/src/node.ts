import { serve } from "@hono/node-server";
import app from "./index";
import { validateEnv } from "./config/env";
import { getDb, ensureSchema, closeDb } from "./db/postgres/client";
import { Logger } from "./utils/logger";

const logger = new Logger("Node");

async function main() {
    const env = validateEnv();
    Logger.initialize();

    const db = getDb(env);
    await ensureSchema(db);

    const server = serve(
        {
            fetch: app.fetch,
            hostname: env.HOST,
            port: env.PORT,
        },
        (info) => {
            logger.info("MCP Monitor API listening", {
                host: info.address,
                port: info.port,
            });
        }
    );

    const shutdown = async () => {
        logger.info("Shutting down");
        server.close();
        await closeDb();
        process.exit(0);
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

main().catch((error) => {
    logger.error("Failed to start API", error as Error);
    process.exit(1);
});
