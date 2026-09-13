import { Hono } from "hono";
import { eq, desc } from "drizzle-orm";
import { servers } from "../db/postgres/schema";
import { instanceSecret } from "../middleware/instance-secret";
import { rateLimit } from "../middleware/rate-limit";
import type { AppEnv } from "../types/index";

const serversRouter = new Hono<AppEnv>();

serversRouter.use("*", instanceSecret);
serversRouter.use("*", rateLimit);

serversRouter.get("/", async (c) => {
    const db = c.get("db");
    const rows = await db
        .select()
        .from(servers)
        .orderBy(desc(servers.lastSeenAt), desc(servers.createdAt));

    return c.json(rows);
});

function isServerId(value: string): boolean {
    return /^[a-zA-Z0-9-]{1,64}$/.test(value);
}

serversRouter.get("/:id", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("id");
    if (!isServerId(serverId)) {
        return c.json({ error: "Server not found" }, 404);
    }

    const [server] = await db
        .select()
        .from(servers)
        .where(eq(servers.id, serverId))
        .limit(1);

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    return c.json(server);
});

serversRouter.delete("/:id", async (c) => {
    const db = c.get("db");
    const serverId = c.req.param("id");
    if (!isServerId(serverId)) {
        return c.json({ error: "Server not found" }, 404);
    }

    const [server] = await db
        .select()
        .from(servers)
        .where(eq(servers.id, serverId))
        .limit(1);

    if (!server) {
        return c.json({ error: "Server not found" }, 404);
    }

    await db.delete(servers).where(eq(servers.id, serverId));

    return c.json({ message: "Server deleted successfully" });
});

export default serversRouter;
