# SDKs

Self-host monitoring SDKs. Same ingest contract in both languages: JSON `{ serverName, events }` and header `X-Instance-Secret`.

| Path | Language | Class |
|---|---|---|
| [js](js) | TypeScript | `MonitoredMcpServer` |
| [py](py) | Python | `MonitoredFastMCP` |

`serverName` is trimmed, lowercased, and given an 8-hex suffix so dashboard rows do not collide across process restarts.
