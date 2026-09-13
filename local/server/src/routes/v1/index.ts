import { Hono } from "hono";
import serversRouter from "../servers";
import metricsRouter from "../metrics";
import analyticsRouter from "../analytics";
import settingsRouter, { getBranding } from "../settings";
import { rateLimit } from "../../middleware/rate-limit";
import type { AppEnv } from "../../types/index";

const v1Router = new Hono<AppEnv>();

v1Router.get("/branding", rateLimit, async (c) => {
    return c.json(await getBranding(c.get("db")));
});

v1Router.route("/servers", serversRouter);
v1Router.route("/metrics", metricsRouter);
v1Router.route("/analytics", analyticsRouter);
v1Router.route("/settings", settingsRouter);

export default v1Router;
