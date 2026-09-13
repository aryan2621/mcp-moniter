import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { instanceSecret } from "../middleware/instance-secret";
import { rateLimit } from "../middleware/rate-limit";
import {
    getOverviewStats,
    getPerformanceMetrics,
    getToolUsageAnalytics,
    getErrorAnalytics,
    getGlobalOverviewStats,
    parseDate,
} from "../services/metrics.service";
import { servers } from "../db/postgres/schema";
import type { AppEnv } from "../types/index";

const analyticsRouter = new Hono<AppEnv>();

analyticsRouter.use("*", instanceSecret);
analyticsRouter.use("*", rateLimit);

async function requireServer(db: AppEnv["Variables"]["db"], serverId: string) {
    const [server] = await db
        .select()
        .from(servers)
        .where(eq(servers.id, serverId))
        .limit(1);
    return server;
}

analyticsRouter.get("/overview", async (c) => {
    const db = c.get("db");
    return c.json(await getGlobalOverviewStats(db));
});

analyticsRouter.get("/servers/:serverId/overview", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await requireServer(db, serverId))) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(
        await getOverviewStats(
            db,
            serverId,
            parseDate(startDate),
            parseDate(endDate)
        )
    );
});

analyticsRouter.get("/servers/:serverId/performance", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await requireServer(db, serverId))) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(
        await getPerformanceMetrics(
            db,
            serverId,
            parseDate(startDate),
            parseDate(endDate)
        )
    );
});

analyticsRouter.get("/servers/:serverId/tools", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await requireServer(db, serverId))) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(
        await getToolUsageAnalytics(
            db,
            serverId,
            parseDate(startDate),
            parseDate(endDate)
        )
    );
});

analyticsRouter.get("/servers/:serverId/errors", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await requireServer(db, serverId))) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(
        await getErrorAnalytics(
            db,
            serverId,
            parseDate(startDate),
            parseDate(endDate)
        )
    );
});

export default analyticsRouter;
