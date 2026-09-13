import type { Context, Next } from "hono";
import type { AppEnv } from "../types/index";

function getVariableSafe<T>(c: Context<AppEnv>, key: keyof AppEnv["Variables"]): T | undefined {
    try {
        return c.get(key) as T;
    } catch {
        return undefined;
    }
}

/**
 * Rate limit middleware using Cloudflare's Rate Limiting binding.
 * Must run after auth so key is per-user (clerk) or per-server (API key).
 * Key: user.id | server.id | "anon:" + path. No-op if binding is not present (e.g. local dev).
 */
export async function rateLimit(c: Context<AppEnv>, next: Next) {
    const limiter = c.env?.API_RATE_LIMITER;
    if (!limiter) {
        await next();
        return;
    }

    const user = getVariableSafe<{ id: string }>(c, "user");
    const server = getVariableSafe<{ id: string }>(c, "server");
    const key = user?.id ?? server?.id ?? `anon:${c.req.path}`;

    const { success } = await limiter.limit({ key });
    if (!success) {
        return c.json({ error: "Too Many Requests" }, 429);
    }

    await next();
}
