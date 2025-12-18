import { Hono } from "hono";
import { jwtAuth } from "../middleware/auth-jwt";
import {
    getOverviewStats,
    getPerformanceMetrics,
    getToolUsageAnalytics,
    getErrorAnalytics,
    getGlobalOverviewStats,
} from "../services/metrics.service";
import { db } from "../db/postgres/client";
import { servers, apiKeys } from "../db/postgres/schema";
import { eq, and, inArray, count } from "drizzle-orm";
import type { User, AppEnv } from "../types/index";

const analyticsRouter = new Hono<AppEnv>();

analyticsRouter.use("*", jwtAuth);

async function validateServerAccess(c: any, serverId: string, userId: string) {
    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.userId, userId)),
    });

    if (!server) {
        return null;
    }
    return server;
}

analyticsRouter.get("/overview", async (c) => {
    const user = c.get("user") as User;

    const userServers = await db.query.servers.findMany({
        where: eq(servers.userId, user.id),
        columns: { id: true },
    });

    const serverIds = userServers.map((s) => s.id);

    if (serverIds.length === 0) {
        return c.json({
            totalServers: 0,
            totalApiKeys: 0,
            totalMetrics: 0,
            errorRate: 0,
        });
    }

    const [apiKeyCount] = await db
        .select({ count: count() })
        .from(apiKeys)
        .where(inArray(apiKeys.serverId, serverIds));

    const globalMetrics = await getGlobalOverviewStats(serverIds);

    return c.json({
        totalServers: serverIds.length,
        totalApiKeys: apiKeyCount.count,
        totalMetrics: globalMetrics.totalCalls,
        errorRate: globalMetrics.errorRate,
    });
});

analyticsRouter.get("/servers/:serverId/overview", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await validateServerAccess(c, serverId, user.id))) {
        return c.json({ error: "Server not found" }, 404);
    }

    const stats = await getOverviewStats(
        serverId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    return c.json(stats);
});

analyticsRouter.get("/servers/:serverId/performance", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await validateServerAccess(c, serverId, user.id))) {
        return c.json({ error: "Server not found" }, 404);
    }

    const metrics = await getPerformanceMetrics(
        serverId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    return c.json(metrics);
});

analyticsRouter.get("/servers/:serverId/tools", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await validateServerAccess(c, serverId, user.id))) {
        return c.json({ error: "Server not found" }, 404);
    }

    const usage = await getToolUsageAnalytics(
        serverId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    return c.json(usage);
});

analyticsRouter.get("/servers/:serverId/errors", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");
    const { startDate, endDate } = c.req.query();

    if (!(await validateServerAccess(c, serverId, user.id))) {
        return c.json({ error: "Server not found" }, 404);
    }

    const errors = await getErrorAnalytics(
        serverId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
    );

    return c.json(errors);
});

export default analyticsRouter;
