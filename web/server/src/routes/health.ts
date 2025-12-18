import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../db/postgres/client";
import { getMongoDb } from "../db/mongodb/client";
import { Logger } from "../utils/logger";

const healthRouter = new Hono();
const logger = new Logger("Health");

async function checkPostgres(): Promise<boolean> {
    try {
        await db.execute(sql`SELECT 1`);
        return true;
    } catch (error) {
        logger.error("PostgreSQL health check failed", error as Error);
        return false;
    }
}

async function checkMongoDB(): Promise<boolean> {
    try {
        const mongoDb = getMongoDb();
        await mongoDb.admin().ping();
        return true;
    } catch (error) {
        logger.error("MongoDB health check failed", error as Error);
        return false;
    }
}

healthRouter.get("/", async (c) => {
    const startTime = Date.now();

    const [postgresHealthy, mongoHealthy] = await Promise.all([
        checkPostgres(),
        checkMongoDB(),
    ]);

    const responseTime = Date.now() - startTime;
    const healthy = postgresHealthy && mongoHealthy;

    return c.json(
        {
            status: healthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            checks: {
                postgres: {
                    healthy: postgresHealthy,
                    status: postgresHealthy ? "up" : "down",
                },
                mongodb: {
                    healthy: mongoHealthy,
                    status: mongoHealthy ? "up" : "down",
                },
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                responseTime,
            },
        },
        healthy ? 200 : 503
    );
});

export default healthRouter;
