# mcp-monitor-sdk (JavaScript)

Cloud monitoring SDK for MCP servers. Same ingest contract as the Python SDK: event array + `X-API-Key`. Server identity comes from the key, not a `serverName` field.

```bash
npm install mcp-monitor-sdk
```

```ts
import { MonitoredMcpServer } from "mcp-monitor-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    apiKey: process.env.MCP_API_KEY!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `apiKey` | yes | | Min 64 characters; sent as `X-API-Key` |
| `metricsServerUrl` | no | Workers `/v1/metrics` | Full ingest URL |
| `batchSize` | no | 10 | Max 100 |
| `retryAttempts` | no | 2 | `0` still tries once |
| `timeout` | no | 5000 ms | |
| `logLevel` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Failed flushes are restored to the buffer. `close()` drains remaining events. Body is a JSON array of `ToolCallEvent` objects, not `{ serverName, events }`.

This package in the repo is referenced by demos as `@local/mcp-monitor-sdk`.
