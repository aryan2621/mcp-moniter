'use client'

import { use, useState } from 'react'
import { useServer } from '@/hooks/use-servers'
import { useOverview, usePerformance, useToolUsage, useErrorAnalytics } from '@/hooks/use-analytics'
import { useApiKeys } from '@/hooks/use-apikeys'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { ToolUsageChart } from '@/components/analytics/tool-usage-chart'
import { ErrorRateChart } from '@/components/analytics/error-rate-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NoDataFound } from '@/components/common/no-data-found'
import { Activity, BarChart2, CheckCircle2, Clock, XCircle, Key } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

export default function ServerAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { server } = useServer(id)
  const [filters] = useState<{ startDate?: string; endDate?: string }>({})

  const { overview, isLoading: overviewLoading } = useOverview(id, filters)
  const { performance, isLoading: perfLoading } = usePerformance(id, filters)
  const { toolUsage, isLoading: toolsLoading } = useToolUsage(id, filters)
  const { errors, isLoading: errorsLoading } = useErrorAnalytics(id, filters)
  const { apiKeys } = useApiKeys(id)

  const activeApiKeysCount = apiKeys?.filter((k) => !k.revokedAt).length ?? 0

  const stats = [
    {
      title: 'Total Calls',
      value: overview?.totalCalls || 0,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Success Rate',
      value: `${((overview?.successRate || 0) * 100).toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      title: 'Avg Duration',
      value: formatDuration(overview?.avgDuration || 0),
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      title: 'Error Rate',
      value: `${((overview?.errorRate || 0) * 100).toFixed(1)}%`,
      icon: XCircle,
      color: 'text-destructive',
    },
    {
      title: 'Active API Keys',
      value: activeApiKeysCount,
      icon: Key,
      color: 'text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-4 pt-2">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!overviewLoading && (overview?.totalCalls ?? 0) === 0 ? (
        <NoDataFound
          icon={BarChart2}
          title="No analytics data yet"
          description="Tool call metrics will appear here once your MCP server starts sending data."
          variant="standalone"
        />
      ) : (
        <>
          {overview?.totalCalls !== 0 && (
            perfLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <PerformanceChart data={performance || []} />
            )
          )}

          {overview?.totalCalls !== 0 && (
            toolsLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <ToolUsageChart data={toolUsage || []} />
            )
          )}

          {overview?.totalCalls !== 0 && (
            errorsLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <ErrorRateChart data={errors || []} />
            )
          )}
        </>
      )}
    </div>
  )
}
