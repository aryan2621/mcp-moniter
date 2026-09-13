export interface Server {
    id: string;
    name: string;
    createdAt: Date;
    lastSeenAt: Date | null;
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

export interface AppEnv {
    Variables: {
        requestId: string;
        db: Db;
    };
}
