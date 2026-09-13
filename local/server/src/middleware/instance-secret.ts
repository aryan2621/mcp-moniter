import { createHash, timingSafeEqual } from "node:crypto";
import type { Context, Next } from "hono";
import { getEnv } from "../config/env";
import type { AppEnv } from "../types/index";

function secretsEqual(provided: string, expected: string): boolean {
    const a = createHash("sha256").update(provided).digest();
    const b = createHash("sha256").update(expected).digest();
    return timingSafeEqual(a, b);
}

export async function instanceSecret(c: Context<AppEnv>, next: Next) {
    const expected = getEnv().INSTANCE_SECRET;
    const provided = c.req.header("X-Instance-Secret") ?? "";

    if (!provided || !secretsEqual(provided, expected)) {
        return c.json({ error: "Invalid instance secret" }, 401);
    }

    await next();
}
