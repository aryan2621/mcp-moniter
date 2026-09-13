'use client'

import { useState } from 'react'
import { useServers } from '@/hooks/use-servers'
import { ServerCard } from '@/components/servers/server-card'
import { DeleteServerDialog } from '@/components/servers/delete-server-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { NoDataFound } from '@/components/common/no-data-found'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Server } from 'lucide-react'

export default function ServersPage() {
  const { servers, isLoading, error } = useServers()
  const [deleteServerId, setDeleteServerId] = useState<string | null>(null)
  const [deleteServerName, setDeleteServerName] = useState('')

  const handleDelete = (serverId: string) => {
    const server = servers?.find((s) => s.id === serverId)
    if (server) {
      setDeleteServerId(serverId)
      setDeleteServerName(server.name)
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servers</h2>
          <p className="text-muted-foreground">
            Unique names appear automatically when the SDK sends metrics
          </p>
        </div>
        <NoDataFound
          icon={AlertCircle}
          title="Couldn't load servers"
          description="Check the API connection and try again."
          variant="standalone"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Servers</h2>
        <p className="text-muted-foreground">
          Unique names appear automatically when the SDK sends metrics
        </p>
      </div>

      {servers && servers.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No servers yet"
          description="Wrap an MCP server with the SDK. The first tool call creates it here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers?.map((server) => (
            <ServerCard key={server.id} server={server} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <DeleteServerDialog
        serverId={deleteServerId}
        serverName={deleteServerName}
        open={!!deleteServerId}
        onOpenChange={(open) => !open && setDeleteServerId(null)}
      />
    </div>
  )
}
