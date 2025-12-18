'use client'

import { use, useState } from 'react'
import { useServer } from '@/hooks/use-servers'
import { useApiKeys } from '@/hooks/use-apikeys'
import { EditServerDialog } from '@/components/servers/edit-server-dialog'
import { DeleteServerDialog } from '@/components/servers/delete-server-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/common/copy-button'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import type { ApiKey } from '@/types'

export default function ServerSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { server } = useServer(id)
  const { apiKeys, createApiKey, revokeApiKey, isCreating, isRevoking, createdApiKey } =
    useApiKeys(id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [showNewKey, setShowNewKey] = useState(false)

  const handleCreateApiKey = () => {
    createApiKey(undefined, {
      onSuccess: () => {
        setShowNewKey(true)
        toast({
          title: 'API key created',
          description: 'Your new API key has been created. Make sure to copy it now!',
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create API key',
          variant: 'destructive',
        })
      },
    })
  }

  const handleRevokeKey = (keyId: string) => {
    revokeApiKey(keyId, {
      onSuccess: () => {
        toast({
          title: 'API key revoked',
          description: 'The API key has been revoked successfully.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to revoke API key',
          variant: 'destructive',
        })
      },
    })
  }

  const columns = [
    {
      header: 'Key',
      cell: (key: ApiKey) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{key.id.slice(0, 8)}...</span>
          <CopyButton value={key.id} />
        </div>
      ),
    },
    {
      header: 'Created',
      cell: (key: ApiKey) => (
        <span className="text-sm text-muted-foreground">{formatDate(key.createdAt)}</span>
      ),
    },
    {
      header: 'Last Used',
      cell: (key: ApiKey) => (
        <span className="text-sm text-muted-foreground">
          {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (key: ApiKey) => (
        <Badge variant={key.revokedAt ? 'destructive' : 'secondary'}>
          {key.revokedAt ? 'Revoked' : 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (key: ApiKey) =>
        !key.revokedAt && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleRevokeKey(key.id)}
            disabled={isRevoking}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ),
    },
  ]

  return (
    <div className="space-y-4 pt-2">

      <Card>
        <CardHeader>
          <CardTitle>Server Details</CardTitle>
          <CardDescription>Manage your server information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium">Name</h4>
            <p className="text-sm text-muted-foreground">{server?.name}</p>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              {server?.description || 'No description'}
            </p>
          </div>
          <Button onClick={() => setEditOpen(true)}>Edit Server</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for this server</CardDescription>
            </div>
            <Button onClick={handleCreateApiKey} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewKey && createdApiKey && (
            <Card className="mb-4 border-primary">
              <CardHeader>
                <CardTitle className="text-sm">New API Key Created</CardTitle>
                <CardDescription>
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted p-2 font-mono text-sm">
                    {createdApiKey}
                  </code>
                  <CopyButton value={createdApiKey} />
                </div>
              </CardContent>
            </Card>
          )}
          <DataTable columns={columns} data={apiKeys || []} emptyMessage="No API keys yet" />
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete Server
          </Button>
        </CardContent>
      </Card>

      {server && (
        <>
          <EditServerDialog server={server} open={editOpen} onOpenChange={setEditOpen} />
          <DeleteServerDialog
            serverId={server.id}
            serverName={server.name}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      )}
    </div>
  )
}
