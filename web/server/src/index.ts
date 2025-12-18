import { Hono } from "hono";
import { cors } from "hono/cors";
import { validateEnv } from "./config/env";
import { Logger } from "./utils/logger";
import { shutdownManager } from "./utils/shutdown";
import type { AppEnv } from "./types/index";
import { requestId } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import { rateLimit } from "./middleware/rate-limit";
import {
    connectMongo,
    createIndexes,
    disconnectMongo,
} from "./db/mongodb/client";
import healthRouter from "./routes/health";
import v1Router from "./routes/v1/index";

const startServer = async () => {
    const env = validateEnv();
    Logger.initialize();
    const logger = new Logger("Server");

    logger.info("Starting MCP Metrics Management Platform", {
        nodeEnv: env.NODE_ENV,
        port: env.PORT,
    });
    try {
        await connectMongo();
        await createIndexes();
        logger.info("MongoDB ready", {
            database: "mcp_metrics",
            indexes: 3,
        });
    } catch (error) {
        logger.error("Failed to connect to databases", error as Error);
        process.exit(1);
    }

    const app = new Hono<AppEnv>();

    app.use("*", requestId);
    app.use("*", errorHandler);
    app.use(
        "*",
        cors({
            origin: env.FRONTEND_URL,
            credentials: true,
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Content-Type", "Authorization"],
        })
    );
    app.use("/v1/*", rateLimit());

    app.get("/", (c) => {
        return c.json({
            service: "MCP Metrics Management Platform",
            version: "1.0.0",
            status: "operational",
            apiVersion: "v1",
            endpoints: {
                health: "GET /health",
                api: "GET /v1/*",
                docs: "https://github.com/your-repo/docs",
            },
        });
    });

    app.route("/health", healthRouter);
    app.route("/v1", v1Router);

    shutdownManager.register(async () => {
        logger.info("Closing database connections");
        await disconnectMongo();
    });

    shutdownManager.setupSignalHandlers();

    logger.info("Server started successfully", {
        port: env.PORT,
        url: `http://localhost:${env.PORT}`,
    });

    return {
        port: env.PORT,
        fetch: app.fetch,
    };
};

startServer()
    .then((server) => {
        Bun.serve({
            port: server.port,
            fetch: server.fetch,
        });
    })
    .catch((error) => {
        const logger = new Logger("Server");
        logger.error("Failed to start server", error as Error);
        process.exit(1);
    });
