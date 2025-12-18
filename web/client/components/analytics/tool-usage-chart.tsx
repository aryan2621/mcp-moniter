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
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface ToolUsageChartProps {
  data: ToolUsage[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function ToolUsageChart({ data }: ToolUsageChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Tool Usage</CardTitle>
        <CardDescription>Frequency and average duration per tool</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis 
              dataKey="toolName" 
              tick={{ fontSize: 12 }}
              strokeOpacity={0.5}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              strokeOpacity={0.5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              formatter={(value, name) => {
                if (name === 'Avg Duration (ms)') {
                  return [`${Number(value).toFixed(2)}ms`, name]
                }
                return [value, name]
              }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Bar 
              dataKey="count" 
              name="Call Count" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar 
              dataKey="avgDuration" 
              name="Avg Duration (ms)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-dur-${index}`} fill={COLORS[(index + 1) % COLORS.length]} fillOpacity={0.5} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
