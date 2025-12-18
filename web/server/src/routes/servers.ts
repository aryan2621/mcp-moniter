import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/postgres/client";
import { servers } from "../db/postgres/schema";
import { jwtAuth } from "../middleware/auth-jwt";
import { eq, and } from "drizzle-orm";
import type { User, AppEnv } from "../types/index";

const serversRouter = new Hono<AppEnv>();

serversRouter.use("*", jwtAuth);

const createServerSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
});

const updateServerSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
});

serversRouter.get("/", async (c) => {
    const user = c.get("user") as User;

    const userServers = await db.query.servers.findMany({
        where: eq(servers.userId, user.id),
        orderBy: (servers, { desc }) => [desc(servers.createdAt)],
    });

    return c.json(userServers);
});

serversRouter.post("/", zValidator("json", createServerSchema), async (c) => {
    const user = c.get("user") as User;
    const { name, description } = c.req.valid("json");

    const [newServer] = await db
        .insert(servers)
        .values({
            userId: user.id,
            name,
            description: description || null,
        })
        .returning();

    return c.json(newServer, 201);
});

serversRouter.get("/:id", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("id");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(server);
});

serversRouter.patch(
    "/:id",
    zValidator("json", updateServerSchema),
    async (c) => {
        const user = c.get("user") as User;
        const serverId = c.req.param("id");
        const updates = c.req.valid("json");

        const server = await db.query.servers.findFirst({
            where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
        });

        if (!server) {
            return c.json({ error: "Server not found" }, 404);
        }

        const [updatedServer] = await db
            .update(servers)
            .set(updates)
            .where(eq(servers.id, serverId))
            .returning();

        return c.json(updatedServer);
    }
);

serversRouter.delete("/:id", async (c) => {
    const user = c.get("user") as User;
    const serverId = c.req.param("id");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.userId, user.id)),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    await db.delete(servers).where(eq(servers.id, serverId));

    return c.json({ message: "Server deleted successfully" });
});

export default serversRouter;
