import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { servers, toolCalls } from "../db/postgres/schema";
import { normalizeServerName } from "../utils/server-name";
import type { Db } from "../db/postgres/client";
import type { ToolCallEvent } from "../types/index";

const DEFAULT_ANALYTICS_WINDOW_MS = 24 * 60 * 60 * 1000;

export function parseDate(value?: string): Date | undefined {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

export function resolveAnalyticsRange(
    startDate?: Date,
    endDate?: Date
): { start: Date; end: Date } {
    const end =
        endDate && Number.isFinite(endDate.getTime()) ? endDate : new Date();
    const start =
        startDate && Number.isFinite(startDate.getTime())
            ? startDate
            : new Date(end.getTime() - DEFAULT_ANALYTICS_WINDOW_MS);
    return { start, end };
}

export async function upsertServerByName(db: Db, rawName: string) {
    const name = normalizeServerName(rawName);
    if (!name) {
        throw new Error("serverName is required");
    }

    const now = new Date();
    const [row] = await db
        .insert(servers)
        .values({
            id: randomUUID(),
            name,
            createdAt: now,
            lastSeenAt: now,
        })
        .onConflictDoUpdate({
            target: servers.name,
            set: { lastSeenAt: now },
        })
        .returning();

    if (!row) {
        throw new Error("failed to upsert server");
    }

    return row;
}

export async function insertMetrics(
    db: Db,
    serverId: string,
    events: ToolCallEvent[]
) {
    if (events.length === 0) {
        return 0;
    }

    const inserted = await db
        .insert(toolCalls)
        .values(
            events.map((event) => ({
                id: randomUUID(),
                serverId,
                callId: event.callId,
                toolName: event.toolName,
                timestamp: new Date(event.timestamp),
                duration: event.duration,
                inputSize: event.inputSize,
                outputSize: event.outputSize ?? null,
                success: event.success,
                error: event.error ?? null,
                errorStack: event.errorStack ?? null,
            }))
        )
        .onConflictDoNothing({
            target: [toolCalls.serverId, toolCalls.callId],
        })
        .returning({ id: toolCalls.id });

    return inserted.length;
}

function timeFilter(startDate?: Date, endDate?: Date) {
    const parts = [];
    if (startDate) parts.push(gte(toolCalls.timestamp, startDate));
    if (endDate) parts.push(lte(toolCalls.timestamp, endDate));
    return parts;
}

export async function getMetricsForServer(
    db: Db,
    serverId: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 100
) {
    const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit)
        ? Math.min(100, Math.max(1, Math.floor(limit)))
        : 100;

    const filters = [eq(toolCalls.serverId, serverId), ...timeFilter(startDate, endDate)];
    const where = and(...filters);

    const [totalRow] = await db
        .select({ total: count() })
        .from(toolCalls)
        .where(where);

    const rows = await db
        .select()
        .from(toolCalls)
        .where(where)
        .orderBy(desc(toolCalls.timestamp))
        .limit(safeLimit)
        .offset((safePage - 1) * safeLimit);

    return {
        metrics: rows.map((row) => ({
            id: row.id,
            timestamp: row.timestamp.toISOString(),
            serverId: row.serverId,
            toolName: row.toolName,
            success: row.success,
            callId: row.callId,
            duration: row.duration,
            inputSize: row.inputSize,
            outputSize: row.outputSize,
            error: row.error,
            errorStack: row.errorStack,
        })),
        total: Number(totalRow?.total ?? 0),
    };
}

export async function getOverviewStats(
    db: Db,
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const range = resolveAnalyticsRange(startDate, endDate);
    const filters = [
        eq(toolCalls.serverId, serverId),
        ...timeFilter(range.start, range.end),
    ];
    const [row] = await db
        .select({
            totalCalls: count(),
            successCount: sql<number>`sum(case when ${toolCalls.success} then 1 else 0 end)`,
            totalDuration: sql<number>`coalesce(sum(${toolCalls.duration}), 0)`,
        })
        .from(toolCalls)
        .where(and(...filters));

    const totalCalls = Number(row?.totalCalls ?? 0);
    if (totalCalls === 0) {
        return { totalCalls: 0, successRate: 0, avgDuration: 0, errorRate: 0 };
    }

    const successCount = Number(row?.successCount ?? 0);
    const totalDuration = Number(row?.totalDuration ?? 0);

    return {
        totalCalls,
        successRate: successCount / totalCalls,
        avgDuration: totalDuration / totalCalls,
        errorRate: (totalCalls - successCount) / totalCalls,
    };
}

function performanceBucket(startDate: Date, endDate: Date): "minute" | "hour" | "day" {
    const spanMs = endDate.getTime() - startDate.getTime();
    if (spanMs <= 6 * 60 * 60 * 1000) return "minute";
    if (spanMs <= 7 * 24 * 60 * 60 * 1000) return "hour";
    return "day";
}

function asRows<T>(result: unknown): T[] {
    if (Array.isArray(result)) return result as T[];
    if (result && typeof result === "object" && "rows" in result) {
        const rows = (result as { rows: T[] }).rows;
        return Array.isArray(rows) ? rows : [];
    }
    return [];
}

export async function getPerformanceMetrics(
    db: Db,
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const range = resolveAnalyticsRange(startDate, endDate);
    const bucket = performanceBucket(range.start, range.end);
    const startIso = range.start.toISOString();
    const endIso = range.end.toISOString();

    const result = await db.execute<{
        bucket: Date | string;
        avg_duration: number;
        p95: number;
        p99: number;
    }>(sql`
        SELECT
            date_trunc(${bucket}, timestamp) AS bucket,
            avg(duration)::float AS avg_duration,
            percentile_cont(0.95) WITHIN GROUP (ORDER BY duration)::float AS p95,
            percentile_cont(0.99) WITHIN GROUP (ORDER BY duration)::float AS p99
        FROM tool_calls
        WHERE server_id = ${serverId}
          AND timestamp >= ${startIso}
          AND timestamp <= ${endIso}
        GROUP BY 1
        ORDER BY 1
    `);

    return asRows<{
        bucket: Date | string;
        avg_duration: number;
        p95: number;
        p99: number;
    }>(result).map((row) => ({
        timestamp: new Date(row.bucket).toISOString(),
        avgDuration: Number(row.avg_duration),
        p95Duration: Number(row.p95),
        p99Duration: Number(row.p99),
    }));
}

export async function getToolUsageAnalytics(
    db: Db,
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const range = resolveAnalyticsRange(startDate, endDate);
    const filters = [
        eq(toolCalls.serverId, serverId),
        ...timeFilter(range.start, range.end),
    ];
    const rows = await db
        .select({
            toolName: toolCalls.toolName,
            count: count(),
            totalDuration: sql<number>`coalesce(sum(${toolCalls.duration}), 0)`,
        })
        .from(toolCalls)
        .where(and(...filters))
        .groupBy(toolCalls.toolName);

    return rows
        .map((row) => ({
            toolName: row.toolName,
            count: Number(row.count),
            avgDuration: Number(row.totalDuration) / Number(row.count),
        }))
        .sort((a, b) => b.count - a.count);
}

export async function getErrorAnalytics(
    db: Db,
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const range = resolveAnalyticsRange(startDate, endDate);
    const filters = [
        eq(toolCalls.serverId, serverId),
        eq(toolCalls.success, false),
        ...timeFilter(range.start, range.end),
    ];

    const rows = await db
        .select({
            errorMessage: sql<string>`coalesce(${toolCalls.error}, 'Unknown Error')`,
            count: count(),
            lastOccurred: sql<Date>`max(${toolCalls.timestamp})`,
        })
        .from(toolCalls)
        .where(and(...filters))
        .groupBy(sql`coalesce(${toolCalls.error}, 'Unknown Error')`);

    return rows
        .map((row) => ({
            errorMessage: row.errorMessage,
            count: Number(row.count),
            lastOccurred: new Date(row.lastOccurred).toISOString(),
        }))
        .sort((a, b) => b.count - a.count);
}

export async function getGlobalOverviewStats(db: Db) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [serverCount] = await db.select({ count: count() }).from(servers);
    const [metrics] = await db
        .select({
            totalCalls: count(),
            successCount: sql<number>`sum(case when ${toolCalls.success} then 1 else 0 end)`,
        })
        .from(toolCalls)
        .where(gte(toolCalls.timestamp, twentyFourHoursAgo));

    const totalCalls = Number(metrics?.totalCalls ?? 0);
    const successCount = Number(metrics?.successCount ?? 0);

    return {
        totalServers: Number(serverCount?.count ?? 0),
        totalMetrics: totalCalls,
        errorRate: totalCalls === 0 ? 0 : (totalCalls - successCount) / totalCalls,
    };
}
