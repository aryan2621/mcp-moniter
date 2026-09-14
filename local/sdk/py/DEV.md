# mcp-monitor-local-sdk — developer guide

Same ingest contract as the JS SDK. Built to sit next to the official [`mcp`](https://pypi.org/project/mcp/) package.

User-facing flow: [USER.md](USER.md).

## Options

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

Events flush when the batch is full or every `flush_interval_ms`. Failed flushes are restored. Shutdown drains remaining events.

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
