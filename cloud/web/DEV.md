# web — developer guide

```
MCP SDK  -->  server (Workers, :8000)  -->  Postgres + Influx
                    ^
client (Next.js) ---+
```

| Path | What it is |
|---|---|
| [client](client) | Dashboard (Clerk) |
| [server](server) | Metrics API (Hono on Workers) |

Create a server and API key in the client, then ingest with `POST /v1/metrics` and header `X-API-Key`.

User-facing flow: [USER.md](USER.md).
