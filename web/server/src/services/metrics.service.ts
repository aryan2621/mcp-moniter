import { getMetricsCollection } from "../db/mongodb/collections.js";
import type { ToolCallEvent } from "../types/index.js";

export async function insertMetrics(serverId: string, events: ToolCallEvent[]) {
    const collection = getMetricsCollection();

    const documents = events.map((event) => ({
        serverId,
        callId: event.callId,
        toolName: event.toolName,
        timestamp: new Date(event.timestamp),
        duration: event.duration,
        inputSize: event.inputSize,
        outputSize: event.outputSize,
        success: event.success,
        error: event.error,
        errorStack: event.errorStack,
    }));

    const result = await collection.insertMany(documents);
    return result.insertedCount;
}

export async function getMetricsForServer(
    serverId: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 100
) {
    const collection = getMetricsCollection();

    const query: any = { serverId };

    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
    }

    const [metrics, total] = await Promise.all([
        collection
            .find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        collection.countDocuments(query),
    ]);

    return {
        metrics,
        total,
    };
}

export async function getOverviewStats(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const collection = getMetricsCollection();
    const match: any = { serverId };

    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
    }

    const stats = await collection
        .aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalCalls: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: ["$success", 1, 0] },
                    },
                    totalDuration: { $sum: "$duration" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalCalls: 1,
                    successRate: {
                        $divide: ["$successCount", "$totalCalls"],
                    },
                    avgDuration: {
                        $divide: ["$totalDuration", "$totalCalls"],
                    },
                    errorRate: {
                        $divide: [
                            {
                                $subtract: [
                                    "$totalCalls",
                                    "$successCount",
                                ],
                            },
                            "$totalCalls",
                        ],
                    },
                },
            },
        ])
        .toArray();

    return (
        stats[0] || {
            totalCalls: 0,
            successRate: 0,
            avgDuration: 0,
            errorRate: 0,
        }
    );
}

export async function getPerformanceMetrics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const collection = getMetricsCollection();
    const match: any = { serverId };

    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
    }

    return await collection
        .aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                        hour: { $hour: "$timestamp" }, // Hourly aggregation
                    },
                    timestamp: { $min: "$timestamp" },
                    avgDuration: { $avg: "$duration" },
                    durations: { $push: "$duration" },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1,
                    "_id.hour": 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    timestamp: 1,
                    avgDuration: 1,
                    p95Duration: {
                        $arrayElemAt: [
                            "$durations",
                            {
                                $floor: {
                                    $multiply: [{ $size: "$durations" }, 0.95],
                                },
                            },
                        ],
                    },
                    p99Duration: {
                        $arrayElemAt: [
                            "$durations",
                            {
                                $floor: {
                                    $multiply: [{ $size: "$durations" }, 0.99],
                                },
                            },
                        ],
                    },
                },
            },
        ])
        .toArray();
}

export async function getToolUsageAnalytics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const collection = getMetricsCollection();
    const match: any = { serverId };

    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
    }

    return await collection
        .aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$toolName",
                    count: { $sum: 1 },
                    avgDuration: { $avg: "$duration" },
                },
            },
            {
                $project: {
                    _id: 0,
                    toolName: "$_id",
                    count: 1,
                    avgDuration: 1,
                },
            },
            { $sort: { count: -1 } },
        ])
        .toArray();
}

export async function getErrorAnalytics(
    serverId: string,
    startDate?: Date,
    endDate?: Date
) {
    const collection = getMetricsCollection();
    const match: any = { serverId, success: false };

    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = startDate;
        if (endDate) match.timestamp.$lte = endDate;
    }

    return await collection
        .aggregate([
            { $match: match },
            {
                $group: {
                    _id: "$error",
                    count: { $sum: 1 },
                    lastOccurred: { $max: "$timestamp" },
                },
            },
            {
                $project: {
                    _id: 0,
                    errorMessage: { $ifNull: ["$_id", "Unknown Error"] },
                    count: 1,
                    lastOccurred: 1,
                },
            },
            { $sort: { count: -1 } },
        ])
        .toArray();
}

export async function getGlobalOverviewStats(serverIds?: string[]) {
    const collection = getMetricsCollection();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const match: any = {
        timestamp: { $gte: twentyFourHoursAgo },
    };

    if (serverIds && serverIds.length > 0) {
        match.serverId = { $in: serverIds };
    }

    const stats = await collection
        .aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalCalls: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: ["$success", 1, 0] },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalCalls: 1,
                    errorRate: {
                        $cond: [
                            { $eq: ["$totalCalls", 0] },
                            0,
                            {
                                $divide: [
                                    {
                                        $subtract: [
                                            "$totalCalls",
                                            "$successCount",
                                        ],
                                    },
                                    "$totalCalls",
                                ],
                            },
                        ],
                    },
                },
            },
        ])
        .toArray();

    return (
        stats[0] || {
            totalCalls: 0,
            errorRate: 0,
        }
    );
}
