# Self-host — user guide

1. Start the API (`docker compose` in this folder) and open the UI or desktop app.
2. On `/connect`, enter `http://localhost:8000` and the same `INSTANCE_SECRET` (≥16 characters).
3. Wrap your MCP server with `mcp-monitor-local-sdk` (`serverName` + `instanceSecret`).
4. Tool-call metrics (name, duration, success/error) go to `POST /v1/metrics` with `X-Instance-Secret` and appear in the local dashboard.

```bash
npm install mcp-monitor-local-sdk
pip install mcp-monitor-local-sdk
```

This is not the hosted product at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/). Do not use an API key here.
