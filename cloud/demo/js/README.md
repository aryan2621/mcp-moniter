# mcp-monitor-demo (JavaScript)

TypeScript sample MCP servers for the cloud API.

```bash
cd cloud/demo/js
npm install
export MCP_API_KEY=<your-api-key>
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
npm run todo-server
npm run attendance-server
```

`MCP_API_KEY` is required (min 64 characters — create it in the dashboard). Optional: `LOG_LEVEL`. Ingest URL defaults to the deployed Workers host if omitted.

JSON stores (`todos.json`, `attendance.json`) sit next to the scripts. A corrupt file keeps the process in memory and does not overwrite the store.

SDK: `@local/mcp-monitor-sdk` → `../../sdk/js`.
