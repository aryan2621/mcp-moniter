# Self-host SDKs — user guide

Wrap your MCP server with `mcp-monitor-local-sdk` and the same instance secret as your local API. The SDK intercepts tool calls and POSTs `{ serverName, events }` to your API. Those events show up in the local dashboard (browser UI or desktop app), not at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/).

```bash
npm install mcp-monitor-local-sdk
pip install mcp-monitor-local-sdk
```
