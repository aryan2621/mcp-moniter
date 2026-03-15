import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const servers = pgTable("servers", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
    id: uuid("id").primaryKey().defaultRandom(),
    serverId: uuid("server_id")
        .notNull()
        .references(() => servers.id, { onDelete: "cascade" }),
    keyHash: varchar("key_hash", { length: 128 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
});

export const serversRelations = relations(servers, ({ many }) => ({
    apiKeys: many(apiKeys),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    server: one(servers, {
        fields: [apiKeys.serverId],
        references: [servers.id],
    }),
}));
