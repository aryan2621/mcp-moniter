# mcp-monitor-ui

Next.js dashboard for the cloud API. Auth is Clerk. Create a server and API key here; MCP SDKs ingest with `X-API-Key`.

```bash
cd cloud/web/client
npm install
npm run dev
```

| Script | |
|---|---|
| `npm run dev` | Next.js |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run type-check` | `tsc --noEmit` |

## Env

| Variable | Notes |
|---|---|
| Clerk keys | Required by `@clerk/nextjs` |
| `NEXT_PUBLIC_LOCAL_API_BASE_URL` | Dev API, default `http://localhost:8000` |
| `NEXT_PUBLIC_API_BASE_URL` | Production API |
| `NEXT_PUBLIC_APP_NAME` | Optional; default `MCP Monitor` |

The API in [../server](../server) must be running (or deployed) for servers, keys, metrics, and analytics.
