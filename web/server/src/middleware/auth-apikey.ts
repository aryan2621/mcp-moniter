import type { Context, Next } from "hono";
import {
    hashApiKey,
    validateApiKeyFormat,
} from "../services/apikey.service.js";
import { apiKeys, servers } from "../db/postgres/schema.js";
import { eq, and, isNull } from "drizzle-orm";
import type { AppEnv } from "../types/index.js";

export async function apiKeyAuth(c: Context<AppEnv>, next: Next) {
    const apiKey = c.req.header("X-API-Key");

    if (!apiKey) {
        return c.json({ error: "Missing X-API-Key header" }, 401);
    }

    if (!validateApiKeyFormat(apiKey)) {
        return c.json({ error: "Invalid API key format" }, 401);
    }

    const keyHash = await hashApiKey(apiKey);
    const db = c.get("db");

    const apiKeyRecord = await db.query.apiKeys.findFirst({
        where: and(eq(apiKeys.keyHash, keyHash), isNull(apiKeys.revokedAt)),
    });

    if (!apiKeyRecord) {
        return c.json({ error: "Invalid or revoked API key" }, 401);
    }

    const server = await db.query.servers.findFirst({
        where: eq(servers.id, apiKeyRecord.serverId),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, apiKeyRecord.id));

    c.set("server", server);

    await next();
}
