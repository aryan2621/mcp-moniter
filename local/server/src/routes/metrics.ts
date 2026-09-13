import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { instanceSecret } from "../middleware/instance-secret";
import { rateLimit } from "../middleware/rate-limit";
import {
    insertMetrics,
    getMetricsForServer,
    upsertServerByName,
    parseDate,
} from "../services/metrics.service";
import { servers } from "../db/postgres/schema";
import type { AppEnv } from "../types/index";

const metricsRouter = new Hono<AppEnv>();

const toolCallEventSchema = z.object({
    callId: z.string().min(1).max(255),
    toolName: z.string().min(1).max(255),
    timestamp: z
        .string()
        .min(1)
        .max(64)
        .refine((value) => Number.isFinite(Date.parse(value)), {
            message: "timestamp must be a valid date",
        }),
    duration: z.number().finite().min(0).max(86_400_000),
    inputSize: z.number().int().min(0).max(50_000_000),
    outputSize: z.number().int().min(0).max(50_000_000).optional(),
    success: z.boolean(),
    error: z.string().max(2000).optional(),
    errorStack: z.string().max(8000).optional(),
});

const ingestSchema = z.object({
    serverName: z.string().min(1).max(255),
    events: z.array(toolCallEventSchema).min(1).max(100),
});

metricsRouter.post(
    "",
    instanceSecret,
    rateLimit,
    zValidator("json", ingestSchema),
    async (c) => {
        const db = c.get("db");
        const { serverName, events } = c.req.valid("json");

        const server = await upsertServerByName(db, serverName);
        const insertedCount = await insertMetrics(db, server.id, events);

        return c.json({
            received: events.length,
            inserted: insertedCount,
            serverId: server.id,
            serverName: server.name,
            timestamp: new Date().toISOString(),
        });
    }
);

const queryParamsSchema = z.object({
    startDate: z.string().max(64).optional(),
    endDate: z.string().max(64).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(100),
});

metricsRouter.get(
    "/servers/:serverId",
    instanceSecret,
    rateLimit,
    zValidator("query", queryParamsSchema),
    async (c) => {
        const db = c.get("db");
        const serverId = c.req.param("serverId");

        const [server] = await db
            .select()
            .from(servers)
            .where(eq(servers.id, serverId))
            .limit(1);

        if (!server) {
            return c.json({ error: "Server not found" }, 404);
        }

        const { startDate, endDate, page, limit } = c.req.valid("query");

        const { metrics, total } = await getMetricsForServer(
            db,
            serverId,
            parseDate(startDate),
            parseDate(endDate),
            page,
            limit
        );

        return c.json({
            serverId,
            metrics,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
);

export default metricsRouter;
