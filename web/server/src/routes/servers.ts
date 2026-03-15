import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { servers } from "../db/postgres/schema";
import { clerkAuth } from "../middleware/clerk-auth";
import { rateLimit } from "../middleware/rate-limit";
import { eq, and, desc, sql } from "drizzle-orm";
import type { User, AppEnv } from "../types/index";

const serversRouter = new Hono<AppEnv>();

serversRouter.use("*", clerkAuth);
serversRouter.use("*", rateLimit);

const createServerSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
});

const updateServerSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
});

serversRouter.get("/", async (c) => {
    const db = c.get("db");
    const user = c.get("user") as User;

    const userServers = await db.execute<{
        id: string;
        clerkUserId: string;
        name: string;
        description: string | null;
        createdAt: Date;
    }>(
        sql`SELECT id, clerk_user_id AS "clerkUserId", name, description, created_at AS "createdAt"
            FROM servers
            WHERE clerk_user_id = ${user.id}
            ORDER BY created_at DESC`
    );

    return c.json(userServers);
});

serversRouter.post("/", zValidator("json", createServerSchema), async (c) => {
    const db = c.get("db");
    const user = c.get("user") as User;
    const { name, description } = c.req.valid("json");

    const [newServer] = await db
        .insert(servers)
        .values({
            clerkUserId: user.id,
            name,
            description: description || null,
        })
        .returning();

    return c.json(newServer, 201);
});

serversRouter.get("/:id", async (c) => {
    const db = c.get("db");
    const user = c.get("user") as User;
    const serverId = c.req.param("id");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.clerkUserId, user.id)),
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
        const db = c.get("db");
        const user = c.get("user") as User;
        const serverId = c.req.param("id");
        const updates = c.req.valid("json");

        const server = await db.query.servers.findFirst({
            where: and(eq(servers.id, serverId), eq(servers.clerkUserId, user.id)),
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
    const db = c.get("db");
    const user = c.get("user") as User;
    const serverId = c.req.param("id");

    const server = await db.query.servers.findFirst({
        where: and(eq(servers.id, serverId), eq(servers.clerkUserId, user.id)),
    });

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    await db.delete(servers).where(eq(servers.id, serverId));

    return c.json({ message: "Server deleted successfully" });
});

export default serversRouter;
