# Self-host API — user guide

This is the process that stores metrics for the local UI and desktop app. After you start it and connect the dashboard with `INSTANCE_SECRET`, `mcp-monitor-local-sdk` POSTs tool-call events here (`/v1/metrics` + `X-Instance-Secret`). Data does not go to the hosted Vercel app.
