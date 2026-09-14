# web — user guide

[client](client) is the dashboard at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/): sign in, create a server, create an API key, then view metrics and analytics.

[server](server) is the ingest API the SDK writes to. Tool calls from `mcp-monitor-sdk` land here (`POST /v1/metrics` + `X-API-Key`) and the dashboard reads the same store.
