'use client'

import { PerformanceMetric } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatDateTime } from '@/lib/utils'

interface PerformanceChartProps {
  data: PerformanceMetric[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Performance Over Time</CardTitle>
        <CardDescription>Average, P95, and P99 durations (ms)</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => formatDateTime(value)}
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
              labelFormatter={(value) => formatDateTime(value as string)}
              formatter={(value) => [`${Number(value).toFixed(2)}ms`, '']}
            />
            <Legend verticalAlign="top" height={36}/>
            <Area
              type="monotone"
              dataKey="avgDuration"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAvg)"
              name="Average"
            />
            <Area
              type="monotone"
              dataKey="p95Duration"
              stroke="#82ca9d"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorP95)"
              name="P95"
            />
            <Area
              type="monotone"
              dataKey="p99Duration"
              stroke="#ffc658"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorP99)"
              name="P99"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
