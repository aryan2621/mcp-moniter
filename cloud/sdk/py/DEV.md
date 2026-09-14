# mcp-monitor-sdk — developer guide

Same payload as the JS SDK. Built to sit next to the official [`mcp`](https://pypi.org/project/mcp/) package.

User-facing flow: [USER.md](USER.md).

When developing this repo against a local API:

```python
server = MonitoredFastMCP(
    "todo-mcp",
    api_key="replace-with-a-64-character-or-longer-api-key",
    metrics_server_url="http://localhost:8000/v1/metrics",
)
```

## Options

| Option | Required | Default | Notes |
|---|---|---|---|
| `api_key` | yes | | Min 64 characters; sent as `X-API-Key` |
| `metrics_server_url` | no | Workers `/v1/metrics` | Full ingest URL |
| `batch_size` | no | 10 | Max 100 |
| `retry_attempts` | no | 2 | `0` still tries once |
| `timeout_ms` | no | 5000 | |
| `flush_interval_ms` | no | 5000 | |
| `log_level` | no | `info` | `debug` \| `info` \| `warn` \| `error` \| `silent` |

Events flush when the batch is full or every `flush_interval_ms`. Failed flushes are restored. Shutdown drains remaining events. Body is a JSON array of events.

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
