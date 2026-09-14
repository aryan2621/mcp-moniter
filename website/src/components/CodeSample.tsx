import { useState } from "react";
import { LINKS } from "../links";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const before = {
  js: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer(
  { name: "todo-mcp", version: "0.1.0" }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

await server.connect(new StdioServerTransport());`,
  py: `from mcp.server.fastmcp import FastMCP

server = FastMCP("todo-mcp")

@server.tool()
def todos_list() -> str:
    """List all todos."""
    return "No todos."

if __name__ == "__main__":
    server.run()`,
} as const;

const samples = {
  "js-hosted": `import { MonitoredMcpServer } from "mcp-monitor-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  { apiKey: process.env.MCP_API_KEY! }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

await server.connect(new StdioServerTransport());`,
  "js-local": `import { MonitoredMcpServer } from "mcp-monitor-local-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new MonitoredMcpServer(
  { name: "todo-mcp", version: "0.1.0" },
  {
    serverName: "todo-mcp",
    instanceSecret: process.env.MCP_MONITOR_SECRET!,
    metricsServerUrl: "http://localhost:8000/v1/metrics",
  }
);

server.registerTool("todos_list", { description: "List all todos" }, async () => ({
  content: [{ type: "text", text: "No todos." }],
}));

await server.connect(new StdioServerTransport());`,
  "py-hosted": `from mcp_monitor_sdk import MonitoredFastMCP

server = MonitoredFastMCP(
    "todo-mcp",
    api_key="replace-with-a-64-character-or-longer-api-key",
)

@server.tool()
def todos_list() -> str:
    """List all todos."""
    return "No todos."

if __name__ == "__main__":
    server.run()`,
  "py-local": `from mcp_monitor_sdk import MonitoredFastMCP

server = MonitoredFastMCP(
    "todo-mcp",
    server_name="todo-mcp",
    instance_secret="change-me-to-a-long-random-secret",
    metrics_server_url="http://localhost:8000/v1/metrics",
)

@server.tool()
def todos_list() -> str:
    """List all todos."""
    return "No todos."

if __name__ == "__main__":
    server.run()`,
} as const;

type Lang = "js" | "py";
type Edition = "hosted" | "local";

const installs = {
  "js-hosted": { cmd: "npm install mcp-monitor-sdk", href: LINKS.npm },
  "js-local": { cmd: "npm install mcp-monitor-local-sdk", href: LINKS.npmLocal },
  "py-hosted": { cmd: "pip install mcp-monitor-sdk", href: LINKS.pypi },
  "py-local": { cmd: "pip install mcp-monitor-local-sdk", href: LINKS.pypiLocal },
} as const;

const MARKS = ["MonitoredMcpServer", "MonitoredFastMCP", "mcp-monitor-sdk", "mcp-monitor-local-sdk"];

function highlight(code: string) {
  const pattern = new RegExp(`(${MARKS.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return code.split(pattern).map((part, index) =>
    MARKS.includes(part) ? (
      <mark key={`${part}-${index}`} className="bg-primary text-primary-foreground">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function CodeSample() {
  const [lang, setLang] = useState<Lang>("js");
  const [edition, setEdition] = useState<Edition>("hosted");
  const [copied, setCopied] = useState(false);
  const key = `${lang}-${edition}` as const;
  const sample = samples[key];
  const install = installs[key];

  async function copy() {
    await navigator.clipboard.writeText(sample);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="border-y py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-3xl font-bold tracking-tight">The wrap is the product</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Documented SDK sample. Hosted and self-host packages are not interchangeable.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={lang} onValueChange={(value) => setLang(value as Lang)}>
            <TabsList>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="py">Python</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Tabs value={edition} onValueChange={(value) => setEdition(value as Edition)}>
              <TabsList>
                <TabsTrigger value="hosted">Hosted</TabsTrigger>
                <TabsTrigger value="local">Self-host</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={() => void copy()}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-lg border lg:grid-cols-[1fr_auto_1fr]">
          <div className="min-w-0">
            <div className="border-b px-4 py-2 font-mono text-[11px] text-muted-foreground">before</div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
              <code>{before[lang]}</code>
            </pre>
          </div>
          <div className="flex items-center justify-center border-y bg-muted/50 px-3 py-2 font-mono text-xs lg:border-x lg:border-y-0">
            <span className="mm-pulse-line">wrap →</span>
          </div>
          <div className="min-w-0">
            <div className="border-b px-4 py-2 font-mono text-[11px]">{install.cmd}</div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
              <code>{highlight(sample)}</code>
            </pre>
          </div>
        </div>

        <Button variant="link" className="mt-4 h-auto p-0 font-mono text-xs" asChild>
          <a href={install.href} target="_blank" rel="noopener noreferrer">
            {install.cmd}
          </a>
        </Button>
      </div>
    </section>
  );
}
