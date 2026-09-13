import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { MonitoredMcpServer } from "@local/mcp-monitor-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateEnv } from "./config/env.js";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

const todos = new Map<string, Todo>();
let saveQueue: Promise<void> = Promise.resolve();

const TodoSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().min(1),
});

const TodosFileSchema = z.array(TodoSchema);

const todosFileUrl = new URL("../todos.json", import.meta.url);

async function loadTodosFromDisk(): Promise<void> {
  try {
    const raw = await readFile(todosFileUrl, "utf8");
    const parsed = TodosFileSchema.parse(JSON.parse(raw));
    todos.clear();
    for (const t of parsed) {
      todos.set(t.id, t);
    }
  } catch (err) {
    const e = err as { code?: unknown };
    if (e && e.code === "ENOENT") return;
    throw err;
  }
}

function queueSaveTodosToDisk(): Promise<void> {
  const snapshot = toArray();
  saveQueue = saveQueue.then(async () => {
    await writeFile(
      todosFileUrl,
      JSON.stringify(snapshot, null, 2) + "\n",
      "utf8"
    );
  });
  return saveQueue;
}

function toArray(): Todo[] {
  return Array.from(todos.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

function asTextList(items: Todo[]): string {
  if (items.length === 0) return "No todos.";
  return items
    .map((t) => `${t.completed ? "[x]" : "[ ]"} ${t.id} ${t.text}`)
    .join("\n");
}

async function main(): Promise<void> {
  const env = validateEnv();

  const server = new MonitoredMcpServer(
    { name: "todo-mcp", version: "0.1.0" },
    {
      apiKey: env.MCP_API_KEY!,
      metricsServerUrl: env.METRICS_SERVER_URL,
      logLevel: env.LOG_LEVEL,
    }
  );

  try {
    await loadTodosFromDisk();
  } catch (error) {
    process.stderr.write(`Failed to load todos: ${(error as Error).message}\n`);
  }

  server.registerTool(
    "todos_add",
    {
      title: "Add todo",
      description: "Add a todo item",
      inputSchema: {
        text: z.string().min(1),
      },
    },
    async ({ text }) => {
      const id = randomUUID();
      const todo: Todo = {
        id,
        text,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      todos.set(id, todo);
      await queueSaveTodosToDisk();
      return {
        content: [{ type: "text", text: `Added ${id}` }],
        structuredContent: { todo },
      };
    }
  );

  server.registerTool(
    "todos_list",
    {
      title: "List todos",
      description: "List all todos",
    },
    async () => {
      const items = toArray();
      return {
        content: [{ type: "text", text: asTextList(items) }],
        structuredContent: { todos: items },
      };
    }
  );

  server.registerTool(
    "todos_toggle",
    {
      title: "Toggle todo",
      description: "Toggle a todo completed state by id",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const todo = todos.get(id);
      if (!todo) {
        return {
          content: [{ type: "text", text: `Not found: ${id}` }],
          isError: true,
        };
      }
      const updated: Todo = { ...todo, completed: !todo.completed };
      todos.set(id, updated);
      await queueSaveTodosToDisk();
      return {
        content: [
          { type: "text", text: `Toggled ${id} -> ${updated.completed}` },
        ],
        structuredContent: { todo: updated },
      };
    }
  );

  server.registerTool(
    "todos_remove",
    {
      title: "Remove todo",
      description: "Remove a todo by id",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const existed = todos.delete(id);
      if (!existed) {
        return {
          content: [{ type: "text", text: `Not found: ${id}` }],
          isError: true,
        };
      }
      await queueSaveTodosToDisk();
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
  const output = {
    timestamp: new Date().toISOString(),
    level: "FATAL",
    message: "Failed to start todo MCP server",
    error: error.message,
    stack: error.stack,
  };
  process.stderr.write(JSON.stringify(output) + "\n");
  process.exit(1);
});
