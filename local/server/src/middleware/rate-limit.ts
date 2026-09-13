import { sql } from "drizzle-orm";
import type { Context, Next } from "hono";
import type { AppEnv } from "../types/index";
import { Logger } from "../utils/logger";

const WINDOW_MS = 60_000;
const LIMITS = {
    ingest: 60,
    read: 300,
    public: 120,
} as const;

const logger = new Logger("RateLimit");

function clientIp(c: Context<AppEnv>): string {
    const forwarded = c.req.header("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return c.req.header("x-real-ip") || "unknown";
}

function classify(c: Context<AppEnv>): keyof typeof LIMITS {
    const path = c.req.path;
    if (!path.startsWith("/v1") || path === "/v1/branding") {
        return "public";
    }
    if (c.req.method === "POST" && /\/metrics\/?$/.test(path)) {
        return "ingest";
    }
    return "read";
}

function asCount(result: unknown): number {
    const rows = Array.isArray(result)
        ? result
        : result && typeof result === "object" && "rows" in result
          ? (result as { rows: Array<{ count?: unknown }> }).rows
          : [];
    const value = rows[0] && typeof rows[0] === "object" ? (rows[0] as { count?: unknown }).count : 1;
    return Number(value ?? 1);
}

export async function rateLimit(c: Context<AppEnv>, next: Next) {
    const kind = classify(c);
    const key = `${kind}:${clientIp(c)}`;
    const db = c.get("db");
    const resetAt = new Date(Date.now() + WINDOW_MS).toISOString();

    try {
        const result = await db.execute(sql`
            INSERT INTO rate_limit_hits (key, count, reset_at)
            VALUES (${key}, 1, ${resetAt}::timestamp)
            ON CONFLICT (key) DO UPDATE SET
                count = CASE
                    WHEN rate_limit_hits.reset_at <= NOW() THEN 1
                    ELSE rate_limit_hits.count + 1
                END,
                reset_at = CASE
                    WHEN rate_limit_hits.reset_at <= NOW() THEN EXCLUDED.reset_at
                    ELSE rate_limit_hits.reset_at
                END
            RETURNING count
        `);

        if (asCount(result) > LIMITS[kind]) {
            return c.json({ error: "Too Many Requests" }, 429);
        }

        if (Math.random() < 0.01) {
            await db.execute(sql`DELETE FROM rate_limit_hits WHERE reset_at < NOW()`);
        }
    } catch (error) {
        logger.error("Rate limit store failed; allowing request", error as Error, { key });
    }

    await next();
}
