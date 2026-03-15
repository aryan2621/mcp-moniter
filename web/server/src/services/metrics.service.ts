import { getWriteApi, getQueryApi, Point } from "../db/influx/client.js";
import { getEnv } from "../config/env.js";
import type { ToolCallEvent } from "../types/index.js";

export async function insertMetrics(serverId: string, events: ToolCallEvent[]) {
    const writeApi = getWriteApi();
    
    events.forEach((event) => {
        const point = new Point("tool_call")
            .tag("serverId", serverId)
            .tag("toolName", event.toolName)
            .tag("success", String(event.success))
            .stringField("callId", event.callId)
            .floatField("duration", event.duration)
            .intField("inputSize", event.inputSize)
            .timestamp(new Date(event.timestamp));
            
        if (event.outputSize !== undefined) {
            point.intField("outputSize", event.outputSize);
        }
        if (event.error) {
            point.stringField("error", event.error);
        }
        if (event.errorStack) {
            point.stringField("errorStack", event.errorStack);
        }
        
        writeApi.writePoint(point);
    });

    try {
        await writeApi.close();
        return events.length;
    } catch (e) {
        console.error("Error writing to InfluxDB", e);
        return 0;
    }
}

export async function getMetricsForServer(
    serverId: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 100
) {
    const queryApi = getQueryApi();
    const env = getEnv();
    
    const start = startDate ? startDate.toISOString() : "0";
    const stop = endDate ? endDate.toISOString() : "now()";

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}")
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
            |> sort(columns: ["_time"], desc: true)
            |> limit(n: ${limit}, offset: ${(page - 1) * limit})
    `;
    
    const countQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}")
            |> filter(fn: (r) => r._field == "callId")
            |> count()
    `;

    const metrics: any[] = [];
    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            metrics.push({
                timestamp: row._time,
                serverId: row.serverId,
                toolName: row.toolName,
                success: row.success === "true",
                callId: row.callId,
                duration: row.duration,
                inputSize: row.inputSize,
                outputSize: row.outputSize,
                error: row.error,
                errorStack: row.errorStack
            });
        }
    } catch (e) {
        console.error("Flux error:", e);
    }

    let total = 0;
    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(countQuery)) {
            total = tableMeta.toObject(values)._value || 0;
        }
    } catch (e) {
        console.error("Flux error:", e);
    }

    return { metrics, total };
}

export async function getOverviewStats(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const queryApi = getQueryApi();
    const env = getEnv();
    const start = startDate ? startDate.toISOString() : "0";
    const stop = endDate ? endDate.toISOString() : "now()";

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}")
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;

    let totalCalls = 0;
    let successCount = 0;
    let totalDuration = 0;

    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            totalCalls++;
            if (row.success === "true") successCount++;
            totalDuration += (row.duration || 0);
        }
    } catch (e) {}

    if (totalCalls === 0) {
        return { totalCalls: 0, successRate: 0, avgDuration: 0, errorRate: 0 };
    }

    return {
        totalCalls,
        successRate: successCount / totalCalls,
        avgDuration: totalDuration / totalCalls,
        errorRate: (totalCalls - successCount) / totalCalls
    };
}

export async function getPerformanceMetrics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const queryApi = getQueryApi();
    const env = getEnv();
    const start = startDate ? startDate.toISOString() : "0";
    const stop = endDate ? endDate.toISOString() : "now()";

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}")
            |> filter(fn: (r) => r._field == "duration")
            |> window(every: 1h)
    `;

    const metricsByWindow: Record<string, number[]> = {};

    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            const windowTs = row._start;
            if (!metricsByWindow[windowTs]) metricsByWindow[windowTs] = [];
            metricsByWindow[windowTs].push(row._value);
        }
    } catch (e) {}

    const results = Object.keys(metricsByWindow).map(ts => {
        const durations = metricsByWindow[ts].sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);
        const avgDuration = sum / durations.length;
        const p95Idx = Math.floor(durations.length * 0.95);
        const p99Idx = Math.floor(durations.length * 0.99);
        
        return {
            timestamp: new Date(ts),
            avgDuration,
            p95Duration: durations[Math.min(p95Idx, durations.length - 1)],
            p99Duration: durations[Math.min(p99Idx, durations.length - 1)]
        };
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return results;
}

export async function getToolUsageAnalytics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const queryApi = getQueryApi();
    const env = getEnv();
    const start = startDate ? startDate.toISOString() : "0";
    const stop = endDate ? endDate.toISOString() : "now()";

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}")
            |> filter(fn: (r) => r._field == "duration")
            |> group(columns: ["toolName"])
    `;

    const usageByTool: Record<string, {count: number, totalDuration: number}> = {};

    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            const tool = row.toolName;
            if (!usageByTool[tool]) usageByTool[tool] = {count: 0, totalDuration: 0};
            usageByTool[tool].count++;
            usageByTool[tool].totalDuration += row._value;
        }
    } catch (e) {}

    return Object.keys(usageByTool).map(tool => ({
        toolName: tool,
        count: usageByTool[tool].count,
        avgDuration: usageByTool[tool].totalDuration / usageByTool[tool].count
    })).sort((a, b) => b.count - a.count);
}

export async function getErrorAnalytics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const queryApi = getQueryApi();
    const env = getEnv();
    const start = startDate ? startDate.toISOString() : "0";
    const stop = endDate ? endDate.toISOString() : "now()";

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${start}, stop: ${stop})
            |> filter(fn: (r) => r._measurement == "tool_call" and r.serverId == "${serverId}" and r.success == "false")
            |> filter(fn: (r) => r._field == "error")
            |> group(columns: ["_value"])
    `;

    const errors: Record<string, {count: number, lastOccurred: Date}> = {};

    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            const errorMsg = row._value || "Unknown Error";
            const ts = new Date(row._time);
            
            if (!errors[errorMsg]) {
                errors[errorMsg] = {count: 0, lastOccurred: new Date(0)};
            }
            errors[errorMsg].count++;
            if (ts > errors[errorMsg].lastOccurred) {
                errors[errorMsg].lastOccurred = ts;
            }
        }
    } catch (e) {}

    return Object.keys(errors).map(msg => ({
        errorMessage: msg,
        count: errors[msg].count,
        lastOccurred: errors[msg].lastOccurred
    })).sort((a, b) => b.count - a.count);
}

export async function getGlobalOverviewStats(serverIds?: string[]) {
    const queryApi = getQueryApi();
    const env = getEnv();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const fluxQuery = `
        from(bucket: "${env.INFLUX_BUCKET}")
            |> range(start: ${twentyFourHoursAgo}, stop: now())
            |> filter(fn: (r) => r._measurement == "tool_call")
            |> filter(fn: (r) => r._field == "callId")
            |> group(columns: ["success", "serverId"])
    `;

    let totalCalls = 0;
    let successCount = 0;

    const allowedServerIds = serverIds && serverIds.length > 0 ? new Set(serverIds) : null;

    try {
        for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
            const row = tableMeta.toObject(values);
            if (allowedServerIds && !allowedServerIds.has(row.serverId)) {
                continue;
            }
            totalCalls++;
            if (row.success === "true") {
                successCount++;
            }
        }
    } catch (e) {}

    if (totalCalls === 0) {
        return { totalCalls: 0, errorRate: 0 };
    }

    return {
        totalCalls,
        errorRate: (totalCalls - successCount) / totalCalls
    };
}
