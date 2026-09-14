# mcp-monitor-local-sdk (JavaScript) — user guide

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
