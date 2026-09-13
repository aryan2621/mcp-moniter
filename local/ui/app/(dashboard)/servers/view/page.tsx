'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useOverview, usePerformance, useToolUsage, useErrorAnalytics } from '@/hooks/use-analytics'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { ToolUsageChart } from '@/components/analytics/tool-usage-chart'
import { ErrorRateChart } from '@/components/analytics/error-rate-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { NoDataFound } from '@/components/common/no-data-found'
import { Activity, BarChart2, CheckCircle2, Clock, XCircle, LineChart, AlertCircle } from 'lucide-react'
import { formatDuration, last24hRange } from '@/lib/utils'

function AnalyticsBody() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const [filters] = useState(last24hRange)

  const { overview, isLoading: overviewLoading, error: overviewError } = useOverview(id, filters)
  const { performance, isLoading: perfLoading, error: perfError } = usePerformance(id, filters)
  const { toolUsage, isLoading: toolsLoading, error: toolsError } = useToolUsage(id, filters)
  const { errors, isLoading: errorsLoading, error: errorsError } = useErrorAnalytics(id, filters)

  if (overviewError || perfError || toolsError || errorsError) {
    return (
      <NoDataFound
        icon={AlertCircle}
        title="Couldn't load analytics"
        description="Check the API connection and try again."
        variant="standalone"
      />
    )
  }

  const stats = [
    { title: 'Total Calls', value: overview?.totalCalls || 0, icon: Activity, color: 'text-blue-600' },
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
  ]

  return (
    <div className="space-y-4 pt-2">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="performance" className="gap-1.5">
              <LineChart className="h-4 w-4 shrink-0" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="tool-usage" className="gap-1.5">
              <BarChart2 className="h-4 w-4 shrink-0" />
              Tool usage
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Errors
            </TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="mt-4">
            {perfLoading ? <Skeleton className="h-[400px] w-full" /> : <PerformanceChart data={performance || []} />}
          </TabsContent>
          <TabsContent value="tool-usage" className="mt-4">
            {toolsLoading ? <Skeleton className="h-[400px] w-full" /> : <ToolUsageChart data={toolUsage || []} />}
          </TabsContent>
          <TabsContent value="errors" className="mt-4">
            {errorsLoading ? <Skeleton className="h-[400px] w-full" /> : <ErrorRateChart data={errors || []} />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default function ServerAnalyticsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AnalyticsBody />
    </Suspense>
  )
}
