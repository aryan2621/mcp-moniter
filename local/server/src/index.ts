import { Hono } from "hono";
import { cors } from "hono/cors";
import { validateEnv, getEnv } from "./config/env";
import { getDb } from "./db/postgres/client";
import { Logger } from "./utils/logger";
import type { AppEnv } from "./types/index";
import { requestId } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";

import healthRouter from "./routes/health";
import v1Router from "./routes/v1/index";

const logger = new Logger("Server");
let envValidatedLogged = false;
const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
    const env = validateEnv(
        (c.env as Record<string, unknown>) ??
            (typeof process !== "undefined" ? process.env : undefined)
    );
    if (!envValidatedLogged) {
        envValidatedLogged = true;
        logger.info("Environment validated", { nodeEnv: env.NODE_ENV });
    }
    await next();
});

app.use("*", requestId);
app.use("*", errorHandler);
app.use("*", async (c, next) => {
    const env = getEnv((c.env as Record<string, unknown>) ?? undefined);
    c.set("db", getDb(env));
    await next();
});
function isAllowedOrigin(origin: string, extraOrigins: string): boolean {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return true;
    }
    if (origin === "tauri://localhost" || origin === "https://tauri.localhost") {
        return true;
    }
    const extras = extraOrigins
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    if (extras.includes("*")) {
        return true;
    }
    return extras.includes(origin);
}

app.use("*", async (c, next) => {
    const extraOrigins = getEnv(
        (c.env as Record<string, unknown>) ?? undefined
    ).CORS_ORIGINS;
    const handler = cors({
        origin: (origin) => {
            if (!origin) return undefined;
            return isAllowedOrigin(origin, extraOrigins) ? origin : null;
        },
        credentials: false,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "X-Instance-Secret"],
    });
    return handler(c, next);
});

app.get("/", (c) => {
    return c.json({
        service: "MCP Monitor",
        edition: "self-host",
        version: "0.1.0",
        status: "operational",
        apiVersion: "v1",
        endpoints: {
            health: "GET /health",
            api: "GET /v1/*",
        },
    });
});

app.route("/health", healthRouter);
app.route("/v1", v1Router);

export default app;
