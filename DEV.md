# MCP Monitor — developer guide

This repo is **two products**. Do not mix their SDKs, auth headers, or ingest bodies.

```
local/   Self-host  (instance secret, Postgres, optional desktop app)
cloud/   Hosted     (API key, Cloudflare Workers, Clerk, Postgres + Influx)
```

User-facing flow: [USER.md](USER.md).

## Choose a product

| | [local](local) | [cloud](cloud) |
|---|---|---|
| Auth | `X-Instance-Secret` | `X-API-Key` |
| Identity | Client-sent `serverName` | API key maps to a server |
| Ingest body | `{ serverName, events }` | JSON array of events |
| API | Hono on Node | Hono on Cloudflare Workers |
| Store | Postgres | Postgres + Influx |
| UI | Next.js (`/connect`) | Next.js + Clerk |
| Desktop | Tauri app around the UI | — |

## Packages

| Artifact | Name |
|---|---|
| Self-host JS SDK | [`mcp-monitor-local-sdk`](local/sdk/js) |
| Self-host Python SDK | [`mcp-monitor-local-sdk`](local/sdk/py) (`import mcp_monitor_sdk`) |
| Cloud JS SDK | [`mcp-monitor-sdk`](cloud/sdk/js) |
| Cloud Python SDK | [`mcp-monitor-sdk`](cloud/sdk/py) (`import mcp_monitor_sdk`) |
| Self-host API image | `gintama2412/mcp-monitor-server` |
| Desktop installers | GitHub Releases |

Cloud package names are the deployed contract. Self-host packages use the `local` suffix so they can publish to the same registries.

## Self-host (`local/`)

```
MCP server + SDK  -->  local/server (Hono, :8000)  -->  Postgres
                              ^
local/ui (Next.js, :3000) ----+
local/app (Tauri) wraps the UI
```

```bash
cd local
cp .env.example .env   # set INSTANCE_SECRET (≥16 chars)
docker compose up --build
cd ui && npm install && npm run dev
```

API: `http://localhost:8000`  
Dashboard: `http://localhost:3000/connect`  
Ingest: `POST /v1/metrics` with `X-Instance-Secret`

Details: [local/DEV.md](local/DEV.md). Demos: [local/demo](local/demo). Makefile: `cd local && make help`.

## Cloud (`cloud/`)

```
MCP server + SDK  -->  cloud/web/server (Workers, :8000)  -->  Postgres + Influx
                              ^
cloud/web/client (Next.js + Clerk) ---+
```

```bash
cd cloud/web/server && npm install && npm run dev
cd cloud/web/client && npm install && npm run dev
```

Create a server and API key in the dashboard (key ≥64 characters), then ingest with `POST /v1/metrics` and `X-API-Key`.

Details: [cloud/DEV.md](cloud/DEV.md). Demos: [cloud/demo](cloud/demo).

## Layout

```
local/
  sdk/js      mcp-monitor-local-sdk
  sdk/py      mcp-monitor-local-sdk
  server      metrics API + Dockerfile
  ui          dashboard
  app         Tauri desktop shell
  demo        sample MCP servers
cloud/
  sdk/js      mcp-monitor-sdk
  sdk/py      mcp-monitor-sdk
  web/server  Workers API
  web/client  Clerk dashboard
  demo        sample MCP servers
test/
  js          inventory MCP (published npm SDK)
  python      shop MCP (published PyPI SDK)
.github/workflows/release.yml
```

## Release

Push a `v*` tag (or run the workflow with a version). That run:

1. Pushes `gintama2412/mcp-monitor-server:<version>` and `:latest` to Docker Hub
2. Builds macOS / Linux / Windows installers
3. Publishes all four SDKs:
   - npm: `mcp-monitor-sdk`, `mcp-monitor-local-sdk`
   - PyPI: `mcp-monitor-sdk`, `mcp-monitor-local-sdk`
4. Creates a GitHub Release and attaches the installers

Requires repo secrets `NPM_TOKEN`, `PYPI_API_TOKEN`, `DOCKERHUB_USERNAME`, and `DOCKERHUB_TOKEN`. The npm token must be able to publish both package names; the PyPI token must be able to publish both projects.
