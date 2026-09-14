# Self-host SDKs — developer guide

Same ingest contract in both languages: JSON `{ serverName, events }` and header `X-Instance-Secret`.

| Path | Language | Package | Class |
|---|---|---|---|
| [js](js) | TypeScript | `mcp-monitor-local-sdk` | `MonitoredMcpServer` |
| [py](py) | Python | `mcp-monitor-local-sdk` | `MonitoredFastMCP` |

`serverName` is trimmed, lowercased, and given an 8-hex suffix so dashboard rows do not collide across process restarts.

User-facing flow: [USER.md](USER.md).
