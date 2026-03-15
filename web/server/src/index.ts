import { Hono } from "hono";
import { cors } from "hono/cors";
import { validateEnv, getEnv } from "./config/env";
import { createDb } from "./db/postgres/client";
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
    // Validate environment variables on the first request if they haven't been validated yet
    // Cloudflare Workers pass environment variables inside `c.env`
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
    c.set("db", createDb(env));
    await next();
});
app.use(
    "*",
    cors({
        origin: (origin) => origin, // In production, replace with proper allowed origins from env
        credentials: true,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
    })
);

app.get("/", (c) => {
    return c.json({
        service: "MCP Metrics Management Platform",
        version: "1.0.0",
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
