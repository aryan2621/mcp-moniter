import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { getEnv } from "../../config/env";
import { Logger } from "../../utils/logger";

let influxDB: InfluxDB | null = null;
const logger = new Logger("InfluxDB");

export function getInfluxClient(): InfluxDB {
    if (!influxDB) {
        const env = getEnv();
        influxDB = new InfluxDB({ url: env.INFLUX_URL, token: env.INFLUX_TOKEN });
        logger.info("Initialized InfluxDB client");
    }
    return influxDB;
}

export function getWriteApi() {
    const env = getEnv();
    const client = getInfluxClient();
    return client.getWriteApi(env.INFLUX_ORG, env.INFLUX_BUCKET, 'ms');
}

export function getQueryApi() {
    const env = getEnv();
    const client = getInfluxClient();
    return client.getQueryApi(env.INFLUX_ORG);
}

export { Point };
