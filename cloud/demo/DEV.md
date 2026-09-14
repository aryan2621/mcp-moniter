# Cloud demos — developer guide

```
demo/
  js/       TypeScript (todo, attendance)
  python/   Python (restaurant)
```

Required env (`MCP_API_KEY` min 64 characters — create it in the cloud dashboard):

```bash
export MCP_API_KEY=<your-api-key>
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
```

Optional: `LOG_LEVEL`. Ingest URL defaults to the deployed Workers host if omitted. Set `METRICS_SERVER_URL` to localhost only when developing the local API.

User-facing flow: [USER.md](USER.md).

## JavaScript

```bash
cd cloud/demo/js
npm install
npm run todo-server
npm run attendance-server
```

JSON stores: `todos.json`, `attendance.json` next to the scripts. If a store file is corrupt, the process keeps running in memory and will not overwrite the file.

The JS SDK is pulled from `../../sdk/js`.

## Python

```bash
cd cloud/demo/python
pip install -e .
MCP_API_KEY=<your-api-key> python restaurant_mcp_server.py
```

The Python SDK is pulled from `../../sdk/py`. Same corrupt-file rule: failed loads disable persist.
