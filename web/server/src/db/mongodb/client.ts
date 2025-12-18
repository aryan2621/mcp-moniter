import { MongoClient } from "mongodb";
import { getEnv } from "../../config/env";
import { Logger } from "../../utils/logger";

let client: MongoClient | null = null;
let connected = false;

export async function connectMongo() {
    if (connected && client) {
        return client;
    }

    const env = getEnv();
    const logger = new Logger("MongoDB");

    try {
        client = new MongoClient(env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        await client.connect();
        connected = true;

        logger.debug("MongoDB connection established");
        return client;
    } catch (error) {
        logger.error("MongoDB connection failed", error as Error, {
            urlPrefix: env.MONGO_URL.substring(0, 30) + "...",
        });
        throw error;
    }
}

export function getMongoDb() {
    if (!client) {
        throw new Error(
            "MongoDB client not initialized. Call connectMongo() first"
        );
    }
    return client.db("mcp_metrics");
}

export async function createIndexes() {
    // Import and call the actual implementation from collections.ts
    const { createIndexes: createCollectionIndexes } =
        await import("./collections.js");
    await createCollectionIndexes();
}

export async function disconnectMongo() {
    if (connected && client) {
        await client.close();
        connected = false;
        client = null;
    }
}
