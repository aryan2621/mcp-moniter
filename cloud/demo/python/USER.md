# Cloud Python demo — user guide

Create a server and API key at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/), export `MCP_API_KEY`, and run the restaurant demo. Tool calls show up on that server in the dashboard. Omit `METRICS_SERVER_URL` for production ingest.

```bash
cd cloud/demo/python
pip install -e .
export MCP_API_KEY=<your-api-key>
python restaurant_mcp_server.py
```
