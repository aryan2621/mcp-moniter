# mcp-monitor-demo (Python)

Python sample MCP servers for the self-host API.

```bash
cd local/demo/python
pip install -e .
export MCP_MONITOR_SECRET=change-me-to-a-long-random-secret
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
python todo_mcp_server.py
python restaurant_mcp_server.py
```

Optional: `MCP_SERVER_NAME`, `LOG_LEVEL`.

JSON stores (`todos.json`, `restaurant.json`) sit next to the scripts. A corrupt file disables persist and does not overwrite the store.

SDK: `mcp-monitor-sdk` → `../../sdk/py`.
