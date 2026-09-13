'use client'

import { useServers } from '@/hooks/use-servers'
import { useGlobalOverview } from '@/hooks/use-analytics'
import { StatsCard } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Server, Activity, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { NoDataFound } from '@/components/common/no-data-found'

export default function DashboardPage() {
  const { servers, isLoading: serversLoading, error: serversError } = useServers()
  const { overview: globalOverview, isLoading: overviewLoading, error: overviewError } = useGlobalOverview()

  const stats = {
    totalServers: globalOverview?.totalServers ?? (Array.isArray(servers) ? servers.length : 0),
    totalMetrics: globalOverview?.totalMetrics || 0,
    errorRate: globalOverview?.errorRate ? (globalOverview.errorRate * 100).toFixed(2) : 0,
  }

  const isLoading = serversLoading || overviewLoading

  if (serversError || overviewError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">MCP servers and metrics on this instance</p>
        </div>
        <NoDataFound
          icon={AlertCircle}
          title="Couldn't load dashboard"
          description="Check the API connection and try again."
          variant="standalone"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">MCP servers and metrics on this instance</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Servers"
            value={stats.totalServers}
            icon={Server}
            description={`${stats.totalServers} active ${stats.totalServers === 1 ? 'server' : 'servers'}`}
          />
          <StatsCard
            title="Total Metrics"
            value={stats.totalMetrics}
            icon={Activity}
            description="Last 24 hours"
          />
          <StatsCard
            title="Error Rate"
            value={`${stats.errorRate}%`}
            icon={AlertCircle}
            description="Last 24 hours"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
