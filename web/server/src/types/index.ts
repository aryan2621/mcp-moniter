import type { Context } from "hono";

export interface User {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
}

export interface Server {
    id: string;
    userId: string;
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

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface AuthContext extends Context {
    user?: User;
    server?: Server;
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

export interface AppEnv {
    Variables: {
        user: User;
        server: Server;
        requestId: string;
    };
}
