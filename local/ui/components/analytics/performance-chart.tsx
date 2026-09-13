'use client'

import { PerformanceMetric } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatDateTime } from '@/lib/utils'
import { CHART_TOOLTIP_STYLE } from '@/lib/constants'
import { NoDataFound } from '@/components/common/no-data-found'

interface PerformanceChartProps {
  data: PerformanceMetric[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Performance Over Time</CardTitle>
          <CardDescription>Average, P95, and P99 durations (ms)</CardDescription>
        </CardHeader>
        <CardContent>
          <NoDataFound title="No performance samples yet" variant="inline" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Performance Over Time</CardTitle>
        <CardDescription>Average, P95, and P99 durations (ms)</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatDateTime(value)}
              tick={{ fontSize: 12 }}
              strokeOpacity={0.5}
            />
            <YAxis tick={{ fontSize: 12 }} strokeOpacity={0.5} />
            <Tooltip
              {...CHART_TOOLTIP_STYLE}
              labelFormatter={(value) => formatDateTime(value as string)}
              formatter={(value) => [`${Number(value).toFixed(2)}ms`, '']}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="avgDuration"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Average"
            />
            <Line
              type="monotone"
              dataKey="p95Duration"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="P95"
            />
            <Line
              type="monotone"
              dataKey="p99Duration"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="P99"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
