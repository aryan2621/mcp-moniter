# mcp-monitor-ui — developer guide

Connection (API URL + instance secret) is stored in `localStorage` after `/connect`.

User-facing flow: [USER.md](USER.md).

```bash
cd local/ui
npm install
npm run dev
```

Opens on `http://localhost:3000`. Point `/connect` at `http://localhost:8000` and the same `INSTANCE_SECRET` as the API.

| Script | |
|---|---|
| `npm run dev` | Next.js on port 3000 |
| `npm run build` | Production build (used by the Tauri app) |
| `npm run type-check` | `tsc --noEmit` |

The API must be running. This app is the frontend for [../app](../app) in desktop mode (`devUrl` `http://localhost:3000`).
