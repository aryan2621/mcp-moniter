import type { Context, Next } from "hono";
import { getEnv } from "../config/env.js";

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit() {
    const env = getEnv();
    const maxRequests = env.RATE_LIMIT_MAX;
    const windowMs = env.RATE_LIMIT_WINDOW_MS;

    return async (c: Context, next: Next) => {
        const identifier =
            c.req.header("X-Forwarded-For") ||
            c.req.header("X-Real-IP") ||
            c.req.header("User-Agent") ||
            "unknown";

        const now = Date.now();
        const entry = store.get(identifier);

        if (!entry || now > entry.resetTime) {
            store.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            await next();
            return;
        }

        if (entry.count >= maxRequests) {
            const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
            return c.json(
                {
                    error: "Too many requests",
                    code: "RATE_LIMIT_EXCEEDED",
                    retryAfter: resetInSeconds,
                    timestamp: new Date().toISOString(),
                },
                429
            );
        }

        entry.count++;
        await next();
    };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
            store.delete(key);
        }
    }
}, 60000);
