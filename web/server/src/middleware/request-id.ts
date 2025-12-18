import { randomUUID } from "crypto";
import type { Context, Next } from "hono";

export async function requestId(c: Context, next: Next) {
    const id = randomUUID();
    c.set("requestId", id);
    c.header("X-Request-ID", id);
    await next();
}
