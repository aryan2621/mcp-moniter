const items = [
  {
    q: "What is recorded?",
    a: "Tool-call metrics only: name, duration, success or error, and payload sizes. Not application logs and not full tool payloads.",
  },
  {
    q: "Hosted vs self-host — which package?",
    a: "Hosted: mcp-monitor-sdk on npm and PyPI, header X-API-Key. Self-host: mcp-monitor-local-sdk on npm and PyPI, header X-Instance-Secret. Do not mix packages, headers, or ingest bodies.",
  },
  {
    q: "Does Python self-host have its own package?",
    a: "Yes. pip install mcp-monitor-local-sdk. The import is still mcp_monitor_sdk.",
  },
  {
    q: "Does the desktop app include the API?",
    a: "No. The desktop app is a window around the self-host UI. You still run the Docker API and Postgres, then connect with the instance secret.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
        <p className="mt-2 text-muted-foreground">The details that usually block a first install.</p>
      </div>
      <div className="divide-y rounded-lg border">
        {items.map((item, index) => (
          <details key={item.q} className="group px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium">
              <span className="mr-2 font-mono text-[11px] text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.q}
            </summary>
            <p className="mm-field-in mt-2 pl-7 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
