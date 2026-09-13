import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { Logger } from "../utils/logger";
import type { AppEnv } from "../types/index";

const healthRouter = new Hono<AppEnv>();
const logger = new Logger("Health");

healthRouter.get("/", async (c) => {
    const startTime = Date.now();
    const db = c.get("db");

    let postgresHealthy = false;
    try {
        await db.execute(sql`SELECT 1`);
        postgresHealthy = true;
    } catch (error) {
        logger.error("PostgreSQL health check failed", error as Error);
    }

    return c.json(
        {
            status: postgresHealthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            checks: {
                postgres: {
                    healthy: postgresHealthy,
                    status: postgresHealthy ? "up" : "down",
                },
            },
            system: {
                responseTime: Date.now() - startTime,
            },
        },
        postgresHealthy ? 200 : 503
    );
});

export default healthRouter;
