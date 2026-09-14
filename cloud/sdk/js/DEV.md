# mcp-monitor-sdk (JavaScript) — developer guide

Same ingest contract as the Python SDK: event array + `X-API-Key`. Server identity comes from the key, not a `serverName` field.

User-facing flow: [USER.md](USER.md).

When developing this repo against a local API:

```ts
new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    apiKey: process.env.MCP_API_KEY!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);
```

## Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `apiKey` | yes | | Min 64 characters; sent as `X-API-Key` |
| `metricsServerUrl` | no | Workers `/v1/metrics` | Full ingest URL |
| `batchSize` | no | 10 | Max 100 |
| `flushIntervalMs` | no | 5000 | Max 60000 |
| `retryAttempts` | no | 2 | `0` still tries once |
| `timeout` | no | 5000 ms | |
| `logLevel` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Events flush when the batch is full or every `flushIntervalMs`. Failed flushes are restored. Shutdown drains remaining events. Body is a JSON array of `ToolCallEvent` objects, not `{ serverName, events }`.

This package in the repo is referenced by demos as `@local/mcp-monitor-sdk`.
