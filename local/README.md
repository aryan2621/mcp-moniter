# MCP Monitor (self-host)

Local observability for MCP servers. Wrap a server with the SDK, send tool-call metrics to a Hono API backed by Postgres, and inspect them in the dashboard.

```
MCP server + SDK  -->  local/server (Hono, :8000)  -->  Postgres
                              ^
local/ui (Next.js, :3000) ----+
local/app (Tauri) wraps the UI
```

## Packages

| Path | What it is |
|---|---|
| [sdk/js](sdk/js) | JS/TS SDK (`MonitoredMcpServer`) |
| [sdk/py](sdk/py) | Python SDK (`MonitoredFastMCP`) |
| [server](server) | Metrics API |
| [ui](ui) | Dashboard |
| [app](app) | Desktop shell |
| [demo](demo) | Sample MCP servers |

## Run the stack

Copy [`.env.example`](.env.example) to `.env` and set `INSTANCE_SECRET` to a random string of at least 16 characters.

```bash
cd local
docker compose up --build
```

API: `http://localhost:8000`  
Health: `GET /health`  
Ingest: `POST /v1/metrics` with header `X-Instance-Secret`

Then in another terminal:

```bash
cd local/ui && npm install && npm run dev
```

Open `http://localhost:3000/connect` and enter the API URL plus the same instance secret.

## Wire an MCP server

JS:

```ts
new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    serverName: "todo-mcp",
    instanceSecret: process.env.MCP_MONITOR_SECRET!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);
```

Python: see [sdk/py](sdk/py). Demos: [demo](demo).

SDKs and the API share one ingest contract: JSON `{ serverName, events }` and header `X-Instance-Secret`. Max batch size is 100. Branding fallbacks (`MCP Monitor` name/description, logo sizes) live independently in the server and UI — keep them in sync if you change copy.
