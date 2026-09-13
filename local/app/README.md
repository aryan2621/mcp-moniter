# mcp-monitor-desktop

Tauri 2 shell around [../ui](../ui). No extra backend — it loads the Next.js dashboard.

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
