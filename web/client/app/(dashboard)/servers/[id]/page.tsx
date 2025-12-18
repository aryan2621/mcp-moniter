'use client'

import { use } from 'react'
import Link from 'next/link'
import { useServer } from '@/hooks/use-servers'
import { useOverview } from '@/hooks/use-analytics'
import { useApiKeys } from '@/hooks/use-apikeys'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatDuration } from '@/lib/utils'
import { Activity, Key, BarChart } from 'lucide-react'

export default function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { server } = useServer(id)
  const { overview, isLoading: overviewLoading } = useOverview(id)
  const { apiKeys } = useApiKeys(id)

  if (!server) return null

  const stats = [
    {
      title: 'Total Calls',
      value: overview?.totalCalls || 0,
      icon: Activity,
    },
    {
      title: 'Success Rate',
      value: `${((overview?.successRate || 0) * 100).toFixed(1)}%`,
      icon: BarChart,
    },
    {
      title: 'Avg Duration',
      value: formatDuration(overview?.avgDuration || 0),
      icon: Activity,
    },
    {
      title: 'Active API Keys',
      value: apiKeys?.filter((k) => !k.revokedAt).length || 0,
      icon: Key,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Information</CardTitle>
          <CardDescription>Details about your MCP server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDate(server.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
