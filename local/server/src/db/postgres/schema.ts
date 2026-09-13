import { pgTable, varchar, text, timestamp, boolean, doublePrecision, integer, uniqueIndex, index } from "drizzle-orm/pg-core";

const idVarchar = { length: 36 } as const;

export const servers = pgTable(
    "servers",
    {
        id: varchar("id", idVarchar).primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        lastSeenAt: timestamp("last_seen_at"),
    },
    (table) => ({
        nameUnique: uniqueIndex("servers_name_unique").on(table.name),
    })
);

export const toolCalls = pgTable(
    "tool_calls",
    {
        id: varchar("id", idVarchar).primaryKey(),
        serverId: varchar("server_id", idVarchar)
            .notNull()
            .references(() => servers.id, { onDelete: "cascade" }),
        callId: varchar("call_id", { length: 255 }).notNull(),
        toolName: varchar("tool_name", { length: 255 }).notNull(),
        timestamp: timestamp("timestamp").notNull(),
        duration: doublePrecision("duration").notNull(),
        inputSize: integer("input_size").notNull(),
        outputSize: integer("output_size"),
        success: boolean("success").notNull(),
        error: text("error"),
        errorStack: text("error_stack"),
    },
    (table) => ({
        serverTimeIdx: index("tool_calls_server_time_idx").on(
            table.serverId,
            table.timestamp
        ),
        serverToolIdx: index("tool_calls_server_tool_idx").on(
            table.serverId,
            table.toolName
        ),
        serverCallUnique: uniqueIndex("tool_calls_server_call_idx").on(
            table.serverId,
            table.callId
        ),
    })
);

export const instanceSettings = pgTable("instance_settings", {
    id: varchar("id", idVarchar).primaryKey(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    companyDescription: text("company_description"),
    logoDataUrl: text("logo_data_url"),
    logoSize: varchar("logo_size", { length: 8 }),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rateLimitHits = pgTable("rate_limit_hits", {
    key: varchar("key", { length: 255 }).primaryKey(),
    count: integer("count").notNull(),
    resetAt: timestamp("reset_at").notNull(),
});
