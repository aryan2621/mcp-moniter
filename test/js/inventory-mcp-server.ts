import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { MonitoredMcpServer } from "mcp-monitor-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateEnv } from "./config/env.js";

type Item = {
  id: string;
  name: string;
  sku: string;
  qty: number;
  createdAt: string;
};

const ItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  qty: z.number().int(),
  createdAt: z.string().min(1),
});

const FileSchema = z.array(ItemSchema);
const storeFileUrl = new URL("./inventory.json", import.meta.url);
const items = new Map<string, Item>();
let saveQueue: Promise<void> = Promise.resolve();
let persistEnabled = false;

async function loadStore(): Promise<void> {
  try {
    const raw = await readFile(storeFileUrl, "utf8");
    const parsed = FileSchema.parse(JSON.parse(raw));
    items.clear();
    for (const item of parsed) {
      items.set(item.id, item);
    }
    persistEnabled = true;
  } catch (err) {
    const e = err as { code?: unknown };
    if (e && e.code === "ENOENT") {
      persistEnabled = true;
      return;
    }
    persistEnabled = false;
    throw err;
  }
}

function queueSave(): Promise<void> {
  if (!persistEnabled) {
    return Promise.resolve();
  }
  const snapshot = toArray();
  saveQueue = saveQueue.then(async () => {
    await writeFile(
      storeFileUrl,
      JSON.stringify(snapshot, null, 2) + "\n",
      "utf8"
    );
  });
  return saveQueue;
}

function toArray(): Item[] {
  return Array.from(items.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

function asText(list: Item[]): string {
  if (list.length === 0) return "Inventory is empty.";
  return list
    .map((item) => `${item.sku}  ${item.name}  qty=${item.qty}  (${item.id})`)
    .join("\n");
}

async function main(): Promise<void> {
  const env = validateEnv();

  const server = new MonitoredMcpServer(
    { name: "inventory-mcp", version: "0.1.1" },
    {
      apiKey: env.MCP_API_KEY,
      metricsServerUrl: env.METRICS_SERVER_URL,
      logLevel: env.LOG_LEVEL,
    }
  );

  try {
    await loadStore();
  } catch (error) {
    process.stderr.write(
      `Failed to load inventory: ${(error as Error).message}\n`
    );
  }

  server.registerTool(
    "inventory_add",
    {
      title: "Add inventory item",
      description: "Add a stock item by name, SKU, and quantity",
      inputSchema: {
        name: z.string().min(1),
        sku: z.string().min(1),
        qty: z.number().int().min(0),
      },
    },
    async ({ name, sku, qty }) => {
      const item: Item = {
        id: randomUUID(),
        name,
        sku,
        qty,
        createdAt: new Date().toISOString(),
      };
      items.set(item.id, item);
      await queueSave();
      return {
        content: [{ type: "text", text: `Added ${name} (${item.id})` }],
        structuredContent: { item },
      };
    }
  );

  server.registerTool(
    "inventory_list",
    {
      title: "List inventory",
      description: "List all inventory items",
    },
    async () => {
      const list = toArray();
      return {
        content: [{ type: "text", text: asText(list) }],
        structuredContent: { items: list },
      };
    }
  );

  server.registerTool(
    "inventory_adjust",
    {
      title: "Adjust inventory quantity",
      description: "Increase or decrease stock by id. Delta can be negative.",
      inputSchema: {
        id: z.string().min(1),
        delta: z.number().int(),
      },
    },
    async ({ id, delta }) => {
      const item = items.get(id);
      if (!item) {
        return {
          content: [{ type: "text", text: `Not found: ${id}` }],
          isError: true,
        };
      }
      const nextQty = item.qty + delta;
      if (nextQty < 0) {
        return {
          content: [
            {
              type: "text",
              text: `Insufficient stock for ${item.sku}: have ${item.qty}, delta ${delta}`,
            },
          ],
          isError: true,
        };
      }
      const updated: Item = { ...item, qty: nextQty };
      items.set(id, updated);
      await queueSave();
      return {
        content: [
          { type: "text", text: `${updated.sku} qty ${item.qty} -> ${updated.qty}` },
        ],
        structuredContent: { item: updated },
      };
    }
  );

  server.registerTool(
    "inventory_remove",
    {
      title: "Remove inventory item",
      description: "Remove an inventory item by id",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const existed = items.delete(id);
      if (!existed) {
        return {
          content: [{ type: "text", text: `Not found: ${id}` }],
          isError: true,
        };
      }
      await queueSave();
      return {
        content: [{ type: "text", text: `Removed ${id}` }],
        structuredContent: { removedId: id },
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const shutdown = async () => {
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((err) => {
  const error = err as Error;
  process.stderr.write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "FATAL",
      message: "Failed to start inventory MCP server",
      error: error.message,
      stack: error.stack,
    }) + "\n"
  );
  process.exit(1);
});
