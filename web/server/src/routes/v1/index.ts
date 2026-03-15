import { Hono } from "hono";
import serversRouter from "../servers";
import apiKeysRouter from "../apikeys";
import metricsRouter from "../metrics";
import analyticsRouter from "../analytics";
import type { AppEnv } from "../../types/index";

const v1Router = new Hono<AppEnv>();

v1Router.route("/servers", serversRouter);
v1Router.route("/metrics", metricsRouter);
v1Router.route("/analytics", analyticsRouter);
v1Router.route("", apiKeysRouter);

export default v1Router;
