# Cloud SDKs — user guide

Wrap your MCP server with this SDK and an API key from [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/). The SDK intercepts tool calls, buffers them, and POSTs them to the hosted ingest API. Those events (tool name, duration, success/error — not application logs) show up on that key’s server in the same dashboard.

```bash
npm install mcp-monitor-sdk
pip install mcp-monitor-sdk
```

Leave the ingest URL unset in production. Identity comes from the API key, not a client-sent server name.
