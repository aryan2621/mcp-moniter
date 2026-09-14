# mcp-monitor-local-sdk (JavaScript) — developer guide

Same ingest contract as the Python SDK.

User-facing flow: [USER.md](USER.md).

## Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `serverName` | yes | | Trimmed and lowercased |
| `instanceSecret` | yes | | Min 16 characters; sent as `X-Instance-Secret` |
| `metricsServerUrl` | yes | | Full ingest URL, usually `http://localhost:8000/v1/metrics` |
| `batchSize` | no | 10 | Max 100 |
| `retryAttempts` | no | 2 | `0` still tries once |
| `timeout` | no | 5000 ms | |
| `flushIntervalMs` | no | 5000 | |
| `logLevel` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Events flush when the batch is full or every `flushIntervalMs`. Failed flushes are restored. Shutdown drains remaining events.

Local checkout: `file:../../sdk/js` from [demo/js](../../demo/js).
