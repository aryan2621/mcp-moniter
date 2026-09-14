# mcp-monitor-sdk — user guide

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
