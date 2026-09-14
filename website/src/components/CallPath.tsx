import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LINKS } from "../links";

const nodes = [
  {
    label: "MCP server",
    title: "Your tools keep their names",
    body: "Register tools as usual. The wrap does not change schemas or transport.",
    code: `server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));`,
    href: null,
    hrefLabel: null,
  },
  {
    label: "Wrap",
    title: "Replace the server class",
    body: "JavaScript: MonitoredMcpServer. Python: MonitoredFastMCP. Hosted uses mcp-monitor-sdk. Self-host uses mcp-monitor-local-sdk.",
    code: `new MonitoredMcpServer({ name: "todo-mcp", version: "0.1.0" }, { apiKey })

MonitoredFastMCP("todo-mcp", api_key="…")`,
    href: "/sdk",
    hrefLabel: "Full SDK sample",
  },
  {
    label: "Ingest",
    title: "POST /v1/metrics",
    body: "Default batch 10, flush every 5s, max 100. Retried. Flushed again on shutdown.",
    code: `Hosted     X-API-Key           JSON array of events
           https://mcp-metrics-server.just-a-dev.workers.dev/v1/metrics

Self-host  X-Instance-Secret   { serverName, events }
           http://localhost:8000/v1/metrics`,
    href: "/editions",
    hrefLabel: "Hosted vs self-host",
  },
  {
    label: "Dashboard",
    title: "Metrics and analytics",
    body: "Same event fields, aggregated on the server’s pages.",
    code: `Analytics  Total Calls · Success Rate · Avg Duration · Error Rate
           Performance (Average, P95, P99)
           Tool usage · Errors

Metrics    Timestamp · Tool · Duration · Input · Output · Status · Error
           Filter by range · CSV export`,
    href: LINKS.dashboard,
    hrefLabel: "Open hosted dashboard",
  },
] as const;

export function CallPath() {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const current = nodes[active];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (paused.current) return;
      setActive((value) => (value + 1) % nodes.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const isExternal = current.href?.startsWith("http");

  return (
    <section
      className="mx-auto max-w-6xl px-6 pb-10"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {nodes.map((node, index) => (
          <li key={node.label}>
            <button
              type="button"
              onClick={() => setActive(index)}
              className={`w-full text-center font-mono text-xs sm:text-sm ${
                index === active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {node.label}
            </button>
          </li>
        ))}
      </ol>
      <div className="relative mx-[12.5%] mt-3 hidden h-3 sm:block">
        <svg className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 overflow-visible" aria-hidden="true">
          <line className="mm-dash" x1="0" y1="1" x2="100%" y2="1" stroke="hsl(var(--primary))" strokeWidth="2" />
        </svg>
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-[left] duration-700"
          style={{ left: `${(active / (nodes.length - 1)) * 100}%` }}
        />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">
              {String(active + 1).padStart(2, "0")} {current.label}
            </p>
            <h2 className="text-lg font-semibold tracking-tight">{current.title}</h2>
          </div>
          {current.href ? (
            isExternal ? (
              <a
                className="font-mono text-xs underline-offset-4 hover:underline"
                href={current.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {current.hrefLabel}
              </a>
            ) : (
              <Link className="font-mono text-xs underline-offset-4 hover:underline" to={current.href}>
                {current.hrefLabel}
              </Link>
            )
          ) : null}
        </div>
        <p className="px-4 pt-3 text-sm text-muted-foreground">{current.body}</p>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
          <code>{current.code}</code>
        </pre>
      </div>
    </section>
  );
}
