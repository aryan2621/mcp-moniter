# Cloud JS demos — user guide

Create a server and API key at [https://mcp-moniter.vercel.app/](https://mcp-moniter.vercel.app/), export `MCP_API_KEY`, and run a demo. Tool calls show up on that server in the dashboard. Omit `METRICS_SERVER_URL` for production ingest.

```bash
cd cloud/demo/js
npm install
export MCP_API_KEY=<your-api-key>
npm run todo-server
```
