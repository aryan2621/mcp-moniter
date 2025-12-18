import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/postgres/client";
import { apiKeys, servers } from "../db/postgres/schema";
import { jwtAuth } from "../middleware/auth-jwt";
import { generateApiKey, hashApiKey } from "../services/apikey.service";
import { eq, and, isNull } from "drizzle-orm";
import type { User, AppEnv } from "../types/index";

const apiKeysRouter = new Hono<AppEnv>();

apiKeysRouter.use("*", jwtAuth);

const createApiKeySchema = z.object({
    name: z.string().min(1).max(255).optional(),
});

apiKeysRouter.get("/servers/:serverId/keys", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("serverId");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    const keys = await db.query.apiKeys.findMany({
        where: eq(apiKeys.serverId, serverId),
        orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
    });

    const keysWithoutHash = keys.map((key) => ({
        id: key.id,
        serverId: key.serverId,
        name: key.name,
        lastUsedAt: key.lastUsedAt,
        createdAt: key.createdAt,
        revokedAt: key.revokedAt,
        isActive: !key.revokedAt,
    }));

    return c.json({ keys: keysWithoutHash });
});

apiKeysRouter.post(
    "/servers/:serverId/keys",
    zValidator("json", createApiKeySchema),
    async (c) => {
        const user = c.get("user") as User;
        const serverId = c.req.param("serverId");
        const { name } = c.req.valid("json");

        const server = await db.query.servers.findFirst({
            where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
        });

        if (!server) {
            return c.json({ error: "Server not found" }, 404);
        }

        const apiKey = generateApiKey();
        const keyHash = hashApiKey(apiKey);

        const [newApiKey] = await db
            .insert(apiKeys)
            .values({
                serverId,
                keyHash,
                name: name || null,
            })
            .returning();

        return c.json(
            {
                apiKey,
                keyInfo: {
                    id: newApiKey.id,
                    serverId: newApiKey.serverId,
                    name: newApiKey.name,
                    createdAt: newApiKey.createdAt,
                },
                warning: "Save this API key! It will not be shown again.",
            },
            201
        );
    }
);

apiKeysRouter.delete("/keys/:id", async (c) => {
    const user = c.get("user") as User;
    const keyId = c.req.param("id");

    const apiKey = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.id, keyId),
        with: {
            server: true,
        },
    });

    if (!apiKey) {
        return c.json({ error: "API key not found" }, 404);
    }

    if (apiKey.server.userId !== user.id) {
        return c.json({ error: "Unauthorized" }, 403);
    }

    await db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(eq(apiKeys.id, keyId));

    return c.json({ message: "API key revoked successfully" });
});

export default apiKeysRouter;
