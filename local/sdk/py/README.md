# mcp-monitor-local-sdk

Self-host monitoring SDK for Python MCP servers. [User guide](#user-guide) · [Developer guide](#developer-guide)

Repo copies: [USER.md](USER.md) · [DEV.md](DEV.md)

## User guide

Point this SDK at your self-host API (`metrics_server_url` + `instance_secret`). It wraps tool handlers and sends tool-call metrics (name, duration, success/error) — not application logs — to `POST /v1/metrics`. Open the local UI or desktop app to see them. This package does not talk to the hosted dashboard.

```bash
pip install mcp-monitor-local-sdk
```

```python
from mcp_monitor_sdk import MonitoredFastMCP

server = MonitoredFastMCP(
    "todo-mcp",
    server_name="todo-mcp",
    instance_secret="change-me-to-a-long-random-secret",
    metrics_server_url="http://localhost:8000/v1/metrics",
)

@server.tool()
def todos_list() -> str:
    """List all todos."""
    return "No todos."

if __name__ == "__main__":
    server.run()
```

`instance_secret` must match `INSTANCE_SECRET` on the API.

## Developer guide

Same ingest contract as the JS SDK. Built to sit next to the official [`mcp`](https://pypi.org/project/mcp/) package.

### Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `server_name` | yes | | Trimmed and lowercased |
| `instance_secret` | yes | | Min 16 characters; sent as `X-Instance-Secret` |
| `metrics_server_url` | yes | | Full ingest URL, usually `http://localhost:8000/v1/metrics` |
| `batch_size` | no | 10 | Max 100 |
| `retry_attempts` | no | 2 | `0` still tries once |
| `timeout_ms` | no | 5000 | |
| `flush_interval_ms` | no | 5000 | |
| `log_level` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Failed flushes are restored to the buffer. Process exit drains remaining events over a sync HTTP POST.

Local checkout:

```bash
pip install -e ./local/sdk/py
```

Publish:

```bash
cd local/sdk/py
python -m build
twine upload dist/*
```
