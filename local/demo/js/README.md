# mcp-monitor-demo (JavaScript)

TypeScript sample MCP servers for the self-host API.

```bash
cd local/demo/js
npm install
export MCP_MONITOR_SECRET=change-me-to-a-long-random-secret
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
npm run todo-server
npm run attendance-server
```

Optional: `MCP_SERVER_NAME`, `LOG_LEVEL`.

JSON stores (`todos.json`, `attendance.json`) sit next to the scripts. A corrupt file keeps the process in memory and does not overwrite the store.

SDK: `@local/mcp-monitor-sdk` → `../../sdk/js`.
