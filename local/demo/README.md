# mcp-monitor-demo

Sample MCP servers that send metrics to the local API.

```
demo/
  js/       TypeScript servers (todo, attendance)
  python/   Python servers (todo, restaurant)
```

Required env (secret min 16 characters):

```bash
export MCP_MONITOR_SECRET=change-me-to-a-long-random-secret
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
```

Optional: `MCP_SERVER_NAME`, `LOG_LEVEL`.

## JavaScript

```bash
cd local/demo/js
npm install
npm run todo-server
npm run attendance-server
```

JSON stores: `todos.json`, `attendance.json` next to the scripts. If a store file is corrupt, the process keeps running in memory and will not overwrite the file.

The JS SDK is pulled from `../../sdk/js`.

## Python

```bash
cd local/demo/python
pip install -e .
MCP_MONITOR_SECRET=change-me-to-a-long-random-secret python todo_mcp_server.py
MCP_MONITOR_SECRET=change-me-to-a-long-random-secret python restaurant_mcp_server.py
```

The Python SDK is pulled from `../../sdk/py`. Same corrupt-file rule: failed loads disable persist.
