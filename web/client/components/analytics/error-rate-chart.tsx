'use client'

import { ErrorAnalytics } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'

interface ErrorRateChartProps {
  data: ErrorAnalytics[]
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6', '#d946ef']

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  const columns = [
    {
      header: 'Error Message',
      cell: (error: ErrorAnalytics) => (
        <span className="font-mono text-sm max-w-[400px] truncate block" title={error.errorMessage}>
          {error.errorMessage}
        </span>
      ),
    },
    {
      header: 'Count',
      cell: (error: ErrorAnalytics) => <Badge variant="destructive">{error.count}</Badge>,
    },
    {
      header: 'Last Occurred',
      cell: (error: ErrorAnalytics) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(error.lastOccurred)}</span>
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Error Analytics</CardTitle>
        <CardDescription>Distribution and frequency of common errors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.length > 0 && (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="errorMessage"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <DataTable columns={columns} data={data} emptyMessage="No errors recorded" />
      </CardContent>
    </Card>
  )
}
