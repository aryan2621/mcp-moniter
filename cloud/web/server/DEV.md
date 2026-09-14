# mcp-monitor-server — developer guide

Hono on Cloudflare Workers. Postgres for servers and API keys; Influx for time-series. Clerk for dashboard users; `X-API-Key` for SDK ingest.

User-facing flow: [USER.md](USER.md).

```bash
cd cloud/web/server
npm install
npm run dev
```

Wrangler serves `http://localhost:8000`. Deploy:

```bash
npm run deploy
```

## Env

Non-secrets in `wrangler.toml` `[vars]`. Put secrets with `wrangler secret put`:

| Variable | Required | Notes |
|---|---|---|
| `POSTGRES_URL` | yes | |
| `INFLUX_URL` | yes | |
| `INFLUX_TOKEN` | yes | secret |
| `INFLUX_ORG` | yes | |
| `INFLUX_BUCKET` | yes | |
| `CLERK_SECRET_KEY` | yes | secret |
| `CLERK_PUBLISHABLE_KEY` | no | |
| `LOG_LEVEL` | no | default `info` |

## Endpoints

- `GET /` — service info
- `GET /health`
- `POST /v1/metrics` — SDK ingest (`X-API-Key`, JSON array of tool-call events, max 100)
- `GET /v1/servers`, API keys, analytics — Clerk `Authorization`

Ingest body is a raw event array, not `{ serverName, events }`. The key maps to a server row. SDKs: [../../sdk](../../sdk).
