import { Activity, AlertCircle, Clock, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const avg = [42, 40, 48, 38, 55, 44, 41, 62, 46, 39, 50, 43];
const p95 = [58, 54, 66, 52, 74, 60, 56, 82, 64, 54, 70, 61];
const p99 = [70, 66, 80, 64, 90, 74, 68, 96, 78, 66, 84, 74];
const width = 640;
const height = 168;
const pad = 8;

function toPoints(values: number[]) {
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / 100) * (height - pad * 2) - pad;
      return `${x},${y}`;
    })
    .join(" ");
}

function toArea(values: number[]) {
  const line = toPoints(values);
  return `M0,${height} L${line.replaceAll(" ", " L")} L${width},${height} Z`;
}

const kpis = [
  { title: "Total Calls", value: "12,847", description: "Last 24 hours", icon: Server },
  { title: "Success Rate", value: "99.2%", description: "Last 24 hours", icon: Activity },
  { title: "Avg Duration", value: "142ms", description: "P95 318ms", icon: Clock },
  { title: "Error Rate", value: "0.8%", description: "Last 24 hours", icon: AlertCircle },
];

const tools = [
  { name: "todos_list", count: 4102, width: "100%" },
  { name: "todos_add", count: 3881, width: "94%" },
  { name: "todos_toggle", count: 3210, width: "78%" },
  { name: "todos_remove", count: 1654, width: "40%" },
];

export function DashboardMock() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">todo-mcp</h3>
          <p className="text-sm text-muted-foreground">Analytics · last 24 hours</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="mm-rec inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
          Active
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="overflow-hidden lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Performance Over Time</CardTitle>
            <CardDescription>Average, P95, and P99 durations (ms)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="Latency chart">
              <path d={toArea(avg)} fill="url(#avgFill)" />
              <polyline points={toPoints(p99)} fill="none" stroke="#ffc658" strokeWidth="2" />
              <polyline points={toPoints(p95)} fill="none" stroke="#82ca9d" strokeWidth="2" />
              <polyline points={toPoints(avg)} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />
              <defs>
                <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Average</span>
              <span style={{ color: "#82ca9d" }}>P95</span>
              <span style={{ color: "#ffc658" }}>P99</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Tool usage</CardTitle>
            <CardDescription>Call count by tool</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tools.map((tool, index) => (
                <li key={tool.name}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="font-mono">{tool.name}</span>
                    <span className="text-muted-foreground">{tool.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="mm-bar h-full rounded-full bg-primary"
                      style={{ width: tool.width, animationDelay: `${index * 90}ms` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
