import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifyJWT } from "../services/auth.service.js";
import { db } from "../db/postgres/client.js";
import { users } from "../db/postgres/schema.js";
import { eq } from "drizzle-orm";

export async function jwtAuth(c: Context, next: Next) {
    const token = getCookie(c, "auth-token");

    if (!token) {
        return c.json({ error: "Missing auth-token cookie" }, 401);
    }

    const payload = await verifyJWT(token);

    if (!payload) {
        return c.json({ error: "Invalid or expired token" }, 401);
    }

    const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
    });

    if (!user) {
        return c.json({ error: "User not found" }, 401);
    }

    c.set("user", {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    });

    await next();
}
