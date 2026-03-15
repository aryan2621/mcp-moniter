import type { Next } from "hono";
import type { Context } from "hono";
import { verifyToken } from "@clerk/backend";
import { getEnv } from "../config/env";
import type { AppEnv } from "../types/index";

export async function clerkAuth(c: Context<AppEnv>, next: Next) {
    try {
        const authHeader = c.req.header("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const token = authHeader.substring(7);
        const env = getEnv();
        
        const secretKey = env.CLERK_SECRET_KEY;
        if (!secretKey) {
            console.error("CLERK_SECRET_KEY not configured");
            return c.json({ error: "Server configuration error" }, 500);
        }

        const payload = await verifyToken(token, { secretKey });
        
        if (!payload.sub) {
            return c.json({ error: "Invalid token" }, 401);
        }

        c.set("user", {
            id: payload.sub as string,
            email: (payload.email as string) || "",
            name: (payload.name as string) || (payload.given_name as string) || null,
            imageUrl: payload.picture as string || null,
        });

        await next();
    } catch (error) {
        console.error("Clerk auth error:", error);
        return c.json({ error: "Authentication failed" }, 401);
    }
}
