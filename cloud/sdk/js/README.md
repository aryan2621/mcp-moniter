# mcp-monitor-sdk (JavaScript)

Hosted monitoring SDK for MCP servers. [User guide](#user-guide) · [Developer guide](#developer-guide)

Repo copies: [USER.md](USER.md) · [DEV.md](DEV.md)

## User guide

Create a server and API key at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/). Wrap your MCP server with this package. Tool-call metrics (name, duration, success/error) are batched and sent to the hosted API. They are not application logs. Open the same dashboard to see metrics and analytics for that key’s server.

```bash
npm install mcp-monitor-sdk
```

```ts
import { MonitoredMcpServer } from "mcp-monitor-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  { apiKey: process.env.MCP_API_KEY! }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

Omit `metricsServerUrl` in production. Default ingest is `https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics`.

## Developer guide

Same ingest contract as the Python SDK: event array + `X-API-Key`. Server identity comes from the key, not a `serverName` field.

When developing this repo against a local API:

```ts
new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    apiKey: process.env.MCP_API_KEY!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);
```

### Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `apiKey` | yes | | Min 64 characters; sent as `X-API-Key` |
| `metricsServerUrl` | no | Workers `/v1/metrics` | Full ingest URL |
| `batchSize` | no | 10 | Max 100 |
| `flushIntervalMs` | no | 5000 | Max 60000 |
| `retryAttempts` | no | 2 | `0` still tries once |
| `timeout` | no | 5000 ms | |
| `logLevel` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Events flush when the batch is full or every `flushIntervalMs`. Failed flushes are restored. Shutdown drains remaining events. Body is a JSON array of `ToolCallEvent` objects, not `{ serverName, events }`.

This package in the repo is referenced by demos as `@local/mcp-monitor-sdk`.
