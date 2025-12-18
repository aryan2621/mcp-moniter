import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { apiKeyAuth } from "../middleware/auth-apikey";
import { jwtAuth } from "../middleware/auth-jwt";
import {
    insertMetrics,
    getMetricsForServer,
} from "../services/metrics.service";
import { db } from "../db/postgres/client";
import { servers } from "../db/postgres/schema";
import { eq, and } from "drizzle-orm";
import type { Server, User, AppEnv } from "../types/index";

const metricsRouter = new Hono<AppEnv>();

const toolCallEventSchema = z.object({
    callId: z.string(),
    toolName: z.string(),
    timestamp: z.string(),
    duration: z.number(),
    inputSize: z.number(),
    outputSize: z.number().optional(),
    success: z.boolean(),
    error: z.string().optional(),
    errorStack: z.string().optional(),
});

const metricsArraySchema = z.array(toolCallEventSchema);

metricsRouter.post(
    "",
    apiKeyAuth,
    zValidator("json", metricsArraySchema),
    async (c) => {
        const server = c.get("server") as Server;
        const events = c.req.valid("json");

        if (events.length === 0) {
            return c.json({ error: "No events provided" }, 400);
        }

        const insertedCount = await insertMetrics(server.id, events);

        return c.json({
            received: events.length,
            inserted: insertedCount,
            serverId: server.id,
            timestamp: new Date().toISOString(),
        });
    }
);

const queryParamsSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    limit: z.string().optional(),
});

metricsRouter.get("/servers/:serverId", jwtAuth, async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    const { startDate, endDate, page, limit } = c.req.query();

    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;

    const { metrics, total } = await getMetricsForServer(
        serverId,
        startDateObj,
        endDateObj,
        pageNum,
        limitNum
    );

    return c.json({
        serverId,
        metrics,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    });
});

export default metricsRouter;
