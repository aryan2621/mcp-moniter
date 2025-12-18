import { getMongoDb } from "./client.js";
import { Logger } from "../../utils/logger.js";

export interface MetricDocument {
    serverId: string;
    callId: string;
    toolName: string;
    timestamp: Date;
    duration: number;
    inputSize: number;
    outputSize?: number;
    success: boolean;
    error?: string;
    errorStack?: string;
}

export function getMetricsCollection() {
    const db = getMongoDb();
    return db.collection<MetricDocument>("metrics");
}

export async function createIndexes() {
    const logger = new Logger("MongoDB");
    const collection = getMetricsCollection();

    await collection.createIndex({ serverId: 1, timestamp: -1 });
    await collection.createIndex({ toolName: 1 });
    await collection.createIndex({ timestamp: -1 });

    logger.debug("Indexes created", {
        count: 3,
    });
}
