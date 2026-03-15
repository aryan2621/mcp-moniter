import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { getQueryApi } from "../db/influx/client";
import { Logger } from "../utils/logger";
import type { AppEnv } from "../types/index";

const healthRouter = new Hono<AppEnv>();
const logger = new Logger("Health");

async function checkPostgres(db: AppEnv["Variables"]["db"]): Promise<boolean> {
    try {
        await db.execute(sql`SELECT 1`);
        return true;
    } catch (error) {
        logger.error("PostgreSQL health check failed", error as Error);
        return false;
    }
}

async function checkInfluxDB(): Promise<boolean> {
    try {
        const queryApi = getQueryApi();
        // A simple query to check if we can reach InfluxDB and parse rows.
        await queryApi.collectRows('buckets() |> limit(n: 1)');
        return true;
    } catch (error) {
        logger.error("InfluxDB health check failed", error as Error);
        return false;
    }
}

healthRouter.get("/", async (c) => {
    const startTime = Date.now();
    const db = c.get("db");

    const [postgresHealthy, influxHealthy] = await Promise.all([
        checkPostgres(db),
        checkInfluxDB(),
    ]);

    const responseTime = Date.now() - startTime;
    const healthy = postgresHealthy && influxHealthy;

    return c.json(
        {
            status: healthy ? "healthy" : "unhealthy",
            timestamp: new Date().toISOString(),
            checks: {
                postgres: {
                    healthy: postgresHealthy,
                    status: postgresHealthy ? "up" : "down",
                },
                influxdb: {
                    healthy: influxHealthy,
                    status: influxHealthy ? "up" : "down",
                },
            },
            system: {
                responseTime,
            },
        },
        healthy ? 200 : 503
    );
});

export default healthRouter;
