# mcp-monitor-sdk

Hosted monitoring SDK for Python MCP servers. [User guide](#user-guide) · [Developer guide](#developer-guide)

Repo copies: [USER.md](USER.md) · [DEV.md](DEV.md)

## User guide

Create a server and API key at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/). Wrap your FastMCP server with this package. Tool-call metrics (name, duration, success/error) are batched and sent to the hosted API. They are not application logs. Open the same dashboard to see metrics and analytics for that key’s server.

```bash
pip install mcp-monitor-sdk
```

```python
from mcp_monitor_sdk import MonitoredFastMCP

server = MonitoredFastMCP(
    "todo-mcp",
    api_key="replace-with-a-64-character-or-longer-api-key",
)

@server.tool()
def todos_list() -> str:
    """List all todos."""
    return "No todos."

if __name__ == "__main__":
    server.run()
```

Omit `metrics_server_url` in production. Default ingest is `https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics`.

## Developer guide

Same payload as the JS SDK. Built to sit next to the official [`mcp`](https://pypi.org/project/mcp/) package.

When developing this repo against a local API:

```python
server = MonitoredFastMCP(
    "todo-mcp",
    api_key="replace-with-a-64-character-or-longer-api-key",
    metrics_server_url="http://localhost:8000/v1/metrics",
)
```

### Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `api_key` | yes | | Min 64 characters; sent as `X-API-Key` |
| `metrics_server_url` | no | Workers `/v1/metrics` | Full ingest URL |
| `batch_size` | no | 10 | Max 100 |
| `retry_attempts` | no | 2 | `0` still tries once |
| `timeout_ms` | no | 5000 | |
| `flush_interval_ms` | no | 5000 | |
| `log_level` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Failed flushes are restored to the buffer. Process exit drains remaining events over a sync HTTP POST. Body is a JSON array of events.

Local checkout:

```bash
pip install -e ./cloud/sdk/py
```

Publish:

```bash
cd cloud/sdk/py
python -m build
twine upload dist/*
```
