# Cloud — user guide

1. Sign in at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/).
2. Create a server, then an API key for it (≥64 characters).
3. Wrap your MCP server with `mcp-monitor-sdk` and pass that key.
4. Leave the ingest URL unset. The SDK posts to `https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics`.
5. When tools run, tool-call metrics (name, duration, success/error) show up on that server’s metrics and analytics pages.

```bash
npm install mcp-monitor-sdk
pip install mcp-monitor-sdk
```

This is not the self-host product. Do not use `instanceSecret` / `X-Instance-Secret` here.
