# Cloud SDKs — developer guide

Same ingest contract in both languages: JSON array of events and header `X-API-Key`.

| Path | Language | Class |
|---|---|---|
| [js](js) | TypeScript | `MonitoredMcpServer` |
| [py](py) | Python | `MonitoredFastMCP` |

API keys must be at least 64 characters. Max batch size is 100.

User-facing flow: [USER.md](USER.md).
