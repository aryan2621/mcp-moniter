# SDKs

Cloud monitoring SDKs. Same ingest contract in both languages: JSON array of events and header `X-API-Key`. Server identity comes from the API key, not a client-sent server name.

| Path | Language | Class |
|---|---|---|
| [js](js) | TypeScript | `MonitoredMcpServer` |
| [py](py) | Python | `MonitoredFastMCP` |

API keys must be at least 64 characters. Max batch size is 100.
