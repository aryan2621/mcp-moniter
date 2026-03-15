export interface User {
    id: string;
    email: string;
    name: string | null;
    imageUrl?: string | null;
    createdAt?: Date;
}

export interface Server {
    id: string;
    clerkUserId: string;
    name: string;
    description: string | null;
    createdAt: Date;
}

export interface ApiKey {
    id: string;
    serverId: string;
    keyHash: string;
    name: string | null;
    lastUsedAt: Date | null;
    createdAt: Date;
    revokedAt: Date | null;
}

export interface ToolCallEvent {
    callId: string;
    toolName: string;
    timestamp: string;
    duration: number;
    inputSize: number;
    outputSize?: number;
    success: boolean;
    error?: string;
    errorStack?: string;
}

import type { Db } from "../db/postgres/client";

export type { Db };

/** Cloudflare Rate Limit binding (Wrangler 4.36+). See https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ */
export interface RateLimitBinding {
    limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface AppEnv {
    Bindings?: {
        API_RATE_LIMITER?: RateLimitBinding;
    };
    Variables: {
        user: User;
        server: Server;
        requestId: string;
        db: Db;
    };
}
