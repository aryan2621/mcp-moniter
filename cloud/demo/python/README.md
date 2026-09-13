# mcp-monitor-demo (Python)

Python sample MCP server for the cloud API.

```bash
cd cloud/demo/python
pip install -e .
export MCP_API_KEY=<your-api-key>
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
python restaurant_mcp_server.py
```

`MCP_API_KEY` is required (min 64 characters — create it in the dashboard). Optional: `LOG_LEVEL`. Ingest URL defaults to the deployed Workers host if omitted.

JSON store (`restaurant.json`) sits next to the script. A corrupt file disables persist and does not overwrite the store.

SDK: `mcp-monitor-sdk` → `../../sdk/py`.
