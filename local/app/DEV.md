# mcp-monitor-desktop — developer guide

Tauri 2 shell around [../ui](../ui). It loads the Next.js dashboard.

User-facing flow: [USER.md](USER.md).

```bash
cd local/ui && npm install
cd ../app && npm install
npm run dev
```

`tauri dev` starts `npm run dev --prefix ../ui` and opens a window at `http://localhost:3000`.

```bash
npm run build
```

Production build expects `local/ui/out` (`frontendDist` in `src-tauri/tauri.conf.json`). Connect the window to a running API the same way as the browser UI.
