# MCP Monitor — user guide

Tool-call metrics (name, duration, success/error) from your MCP server, in a dashboard. This is not application logging.

Two ways to use this. Do not mix them.

## Hosted

1. Sign in at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/).
2. Create a server, then an API key for it (≥64 characters).
3. Wrap your MCP server with `mcp-monitor-sdk` and pass that key.
4. Leave the ingest URL unset. The SDK posts to `https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics`.
5. When tools run, events appear on that server’s metrics and analytics pages in the same dashboard.

```bash
npm install mcp-monitor-sdk
pip install mcp-monitor-sdk
```

## Self-host

1. Start the API (`docker compose` in `local/`) and open the UI or desktop app.
2. On `/connect`, enter `http://localhost:8000` and the same `INSTANCE_SECRET`.
3. Wrap your MCP server with `mcp-monitor-local-sdk` (`serverName` + `instanceSecret`).
4. Tool calls go to `POST /v1/metrics` with `X-Instance-Secret` and appear in the local dashboard.

```bash
npm install mcp-monitor-local-sdk
pip install mcp-monitor-local-sdk
```

Hosted uses `X-API-Key`. Self-host uses `X-Instance-Secret`.
