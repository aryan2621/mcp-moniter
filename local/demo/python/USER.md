# Self-host Python demos — user guide

Start the local API and dashboard, export `MCP_MONITOR_SECRET` to the same instance secret, then run a demo. Tool calls show up in the local UI. These demos do not send data to [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/).

```bash
cd local/demo/python
pip install -e .
export MCP_MONITOR_SECRET=change-me-to-a-long-random-secret
export METRICS_SERVER_URL=http://localhost:8000/v1/metrics
python todo_mcp_server.py
```
