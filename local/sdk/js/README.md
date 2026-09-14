# mcp-monitor-local-sdk (JavaScript)

Self-host monitoring SDK for MCP servers. [User guide](#user-guide) · [Developer guide](#developer-guide)

Repo copies: [USER.md](USER.md) · [DEV.md](DEV.md)

## User guide

Point this SDK at your self-host API (`metricsServerUrl` + `instanceSecret`). It wraps tool handlers and sends tool-call metrics (name, duration, success/error) — not application logs — to `POST /v1/metrics`. Open the local UI or desktop app to see them. This package does not talk to the hosted dashboard.

```bash
npm install mcp-monitor-local-sdk
```

```ts
import { MonitoredMcpServer } from "mcp-monitor-local-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    serverName: "todo-mcp",
    instanceSecret: "change-me-to-a-long-random-secret",
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

`instanceSecret` must match `INSTANCE_SECRET` on the API.

## Developer guide

Same ingest contract as the Python SDK.

### Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `serverName` | yes | | Trimmed and lowercased |
| `instanceSecret` | yes | | Min 16 characters; sent as `X-Instance-Secret` |
| `metricsServerUrl` | yes | | Full ingest URL, usually `http://localhost:8000/v1/metrics` |
| `batchSize` | no | 10 | Max 100 |
| `retryAttempts` | no | 2 | `0` still tries once |
| `timeout` | no | 5000 ms | |
| `flushIntervalMs` | no | 5000 | |
| `logLevel` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Events flush when the batch is full or every `flushIntervalMs`. Failed flushes are restored. Shutdown drains remaining events.

Local checkout: `file:../../sdk/js` from [demo/js](../../demo/js).
