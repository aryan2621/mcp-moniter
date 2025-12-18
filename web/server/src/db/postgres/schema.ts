import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const servers = pgTable("servers", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
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

export const usersRelations = relations(users, ({ many }) => ({
    servers: many(servers),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
    user: one(users, {
        fields: [servers.userId],
        references: [users.id],
    }),
    apiKeys: many(apiKeys),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
    server: one(servers, {
        fields: [apiKeys.serverId],
        references: [servers.id],
    }),
}));
