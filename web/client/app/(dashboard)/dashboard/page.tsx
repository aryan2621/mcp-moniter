'use client'

import { useServers } from '@/hooks/use-servers'
import { useAuth } from '@/hooks/use-auth'
import { useGlobalOverview } from '@/hooks/use-analytics'
import { StatsCard } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Server, Key, Activity, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user } = useAuth()
  const { servers, isLoading: serversLoading } = useServers()
  const { overview: globalOverview, isLoading: overviewLoading } = useGlobalOverview()

  const stats = {
    totalServers: globalOverview?.totalServers ?? (servers?.length || 0),
    totalApiKeys: globalOverview?.totalApiKeys || 0,
    totalMetrics: globalOverview?.totalMetrics || 0,
    errorRate: globalOverview?.errorRate ? (globalOverview.errorRate * 100).toFixed(2) : 0,
  }

  const isLoading = serversLoading || overviewLoading

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your MCP servers and metrics
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Servers"
            value={stats.totalServers}
            icon={Server}
            description={`${stats.totalServers} active ${stats.totalServers === 1 ? 'server' : 'servers'}`}
          />
          <StatsCard
            title="API Keys"
            value={stats.totalApiKeys}
            icon={Key}
            description="Across all servers"
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
