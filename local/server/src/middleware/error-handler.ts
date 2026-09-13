import type { Context, Next } from "hono";
import { Logger } from "../utils/logger.js";
import { ZodError } from "zod";

const logger = new Logger("ErrorHandler");

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        const requestId = c.get("requestId");
        const err = error as Error;

        logger.error("Request failed", err, {
            requestId,
            path: c.req.path,
            method: c.req.method,
        });

        if (error instanceof ZodError) {
            return c.json(
                {
                    error: "Validation failed",
                    code: "VALIDATION_ERROR",
                    details: error.errors,
                    requestId,
                    timestamp: new Date().toISOString(),
                },
                400
            );
        }

        return c.json(
            {
                error: "Internal server error",
                code: "INTERNAL_ERROR",
                requestId,
                timestamp: new Date().toISOString(),
            },
            500
        );
    }
}
