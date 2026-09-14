# mcp-monitor-local-sdk — user guide

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
