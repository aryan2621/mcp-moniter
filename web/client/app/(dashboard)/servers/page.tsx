'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useServers } from '@/hooks/use-servers'
import { ServerCard } from '@/components/servers/server-card'
import { CreateServerDialog } from '@/components/servers/create-server-dialog'
import { EditServerDialog } from '@/components/servers/edit-server-dialog'
import { DeleteServerDialog } from '@/components/servers/delete-server-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Server as ServerType } from '@/types'
import { Server } from 'lucide-react'

export default function ServersPage() {
  const { servers, isLoading } = useServers()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)
  const [editServer, setEditServer] = useState<ServerType | null>(null)
  const [deleteServerId, setDeleteServerId] = useState<string | null>(null)
  const [deleteServerName, setDeleteServerName] = useState('')

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setCreateOpen(true)
      router.replace('/servers')
    }
  }, [router, searchParams])

  const handleEdit = (server: ServerType) => {
    setEditServer(server)
  }

  const handleDelete = (serverId: string) => {
    const server = servers?.find((s) => s.id === serverId)
    if (server) {
      setDeleteServerId(serverId)
      setDeleteServerName(server.name)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servers</h2>
          <p className="text-muted-foreground">Manage your MCP servers</p>
        </div>
        <CreateServerDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>

      {servers && servers.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No servers yet"
          description="Create your first MCP server to start monitoring metrics"
          action={{
            label: 'Create Server',
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {servers?.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditServerDialog
        server={editServer}
        open={!!editServer}
        onOpenChange={(open) => !open && setEditServer(null)}
      />

      <DeleteServerDialog
        serverId={deleteServerId}
        serverName={deleteServerName}
        open={!!deleteServerId}
        onOpenChange={(open) => !open && setDeleteServerId(null)}
      />
    </div>
  )
}
