# Cloud — developer guide

```
MCP server + SDK  -->  cloud/web/server (Workers, :8000)  -->  Postgres + Influx
                              ^
cloud/web/client (Next.js) ---+
```

Identity is the **API key**, not a client-sent server name. Ingest body is a JSON array of events with header `X-API-Key`.

User-facing flow: [USER.md](USER.md).

## Packages

| Path | What it is |
|---|---|
| [sdk/js](sdk/js) | JS/TS SDK (`MonitoredMcpServer`) |
| [sdk/py](sdk/py) | Python SDK (`MonitoredFastMCP`) |
| [web/server](web/server) | Metrics API (Hono on Workers) |
| [web/client](web/client) | Dashboard (Clerk) |
| [demo](demo) | Sample MCP servers |

This is a separate product from [../local](../local). Do not mix `instanceSecret` / `X-Instance-Secret` here.

## Run

API (Wrangler, port 8000):

```bash
cd cloud/web/server
npm install
npm run dev
```

Dashboard:

```bash
cd cloud/web/client
npm install
npm run dev
```

Create a server and API key in the UI, then point a demo or your MCP at `POST /v1/metrics`.

## Wire an MCP server

JS:

```ts
new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    apiKey: process.env.MCP_API_KEY!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);
```

Python: see [sdk/py](sdk/py). Demos: [demo](demo).

Default ingest URL in the SDKs is the deployed Workers host if `metricsServerUrl` is omitted. API keys must be at least 64 characters. Max batch size is 100.
