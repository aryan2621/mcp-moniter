# mcp-monitor-server — developer guide

Hono on Node, Postgres for servers, tool calls, settings, and rate limits.

User-facing flow: [USER.md](USER.md).

## Run

From `local/`, copy `.env.example` to `.env` and set `INSTANCE_SECRET` (min 16 characters).

```bash
cd local
docker compose up --build
```

Or locally (Postgres must already be up):

```bash
cd local/server
npm install
POSTGRES_URL=postgres://mcp:mcp@localhost:5432/mcp_monitor \
INSTANCE_SECRET=change-me-to-a-long-random-secret \
npm run dev
```

Listens on `PORT` (default `8000`). Schema is created on boot.

## Env

| Variable | Required | Default |
|---|---|---|
| `POSTGRES_URL` | yes | |
| `INSTANCE_SECRET` | yes | min 16 chars |
| `PORT` | no | `8000` |
| `HOST` | no | `0.0.0.0` |
| `LOG_LEVEL` | no | `info` |
| `CORS_ORIGINS` | no | localhost + Tauri origins always allowed |

## Endpoints

- `GET /` — service info
- `GET /health` — Postgres ping
- `GET /v1/branding` — public name/logo (rate-limited)
- `POST /v1/metrics` — SDK ingest (`X-Instance-Secret`, max 100 events)
- `GET /v1/servers`, `GET/DELETE /v1/servers/:id`
- `GET /v1/metrics/servers/:serverId`
- `GET /v1/analytics/...`
- `GET/PUT /v1/settings`

Protected routes require header `X-Instance-Secret`. Ingest is idempotent on `(server_id, call_id)`. Analytics defaults to the last 24 hours when no dates are sent.
