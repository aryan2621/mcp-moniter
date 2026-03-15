'use client'

import { ToolUsage } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ToolUsageChartProps {
  data: ToolUsage[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: { color: 'hsl(var(--foreground))' },
  labelStyle: { color: 'hsl(var(--foreground))' },
  cursor: { fill: 'hsl(var(--muted))', opacity: 0.1 },
}

export function ToolUsageChart({ data }: ToolUsageChartProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Tool call count</CardTitle>
          <CardDescription>Number of invocations per tool</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis
                dataKey="toolName"
                tick={{ fontSize: 12 }}
                strokeOpacity={0.5}
              />
              <YAxis tick={{ fontSize: 12 }} strokeOpacity={0.5} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Tool average duration</CardTitle>
          <CardDescription>Average execution time per tool (ms)</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis
                dataKey="toolName"
                tick={{ fontSize: 12 }}
                strokeOpacity={0.5}
              />
              <YAxis tick={{ fontSize: 12 }} strokeOpacity={0.5} tickFormatter={(v) => `${v}ms`} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => [`${Number(value ?? 0).toFixed(2)} ms`, 'Avg duration']}
              />
              <Bar dataKey="avgDuration" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-dur-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
