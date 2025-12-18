'use client'

import { useServers } from '@/hooks/use-servers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { Server } from 'lucide-react'

export function RecentActivity() {
  const { servers, isLoading } = useServers()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recently created servers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentServers = servers?.slice(0, 5) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recently created servers</CardDescription>
      </CardHeader>
      <CardContent>
        {recentServers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No servers yet</p>
        ) : (
          <div className="space-y-4">
            {recentServers.map((server) => (
              <div key={server.id} className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Server className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{server.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDate(server.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
