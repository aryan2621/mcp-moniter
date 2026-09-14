# mcp-monitor-sdk (JavaScript) — user guide

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
