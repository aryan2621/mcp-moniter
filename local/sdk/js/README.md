# mcp-monitor-sdk (JavaScript)

Self-host monitoring SDK for MCP servers. Same ingest contract as the Python SDK.

```bash
npm install mcp-monitor-sdk
```

```ts
import { MonitoredMcpServer } from "mcp-monitor-sdk";
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

## Options

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

Failed flushes are put back on the buffer. `close()` stops the timer and drains remaining events.

This package in the repo is referenced by demos as `@local/mcp-monitor-sdk`.
