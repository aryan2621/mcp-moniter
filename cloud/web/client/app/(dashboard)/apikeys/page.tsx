'use client'

import { useServers } from '@/hooks/use-servers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { CopyButton } from '@/components/common/copy-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { useApiKeys } from '@/hooks/use-apikeys'
import { formatDate } from '@/lib/utils'
import { Key, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApiKeysPage() {
  const router = useRouter()
  const { servers, isLoading: serversLoading } = useServers()
  const [selectedServerId, setSelectedServerId] = useState<string>('')

  const {
    apiKeys,
    isLoading: keysLoading,
    createApiKey,
    revokeApiKey,
    isCreating,
    isRevoking,
    createdApiKey,
    createdApiKeyInfo,
  } = useApiKeys(selectedServerId)

  const [showNewKey, setShowNewKey] = useState(false)

  const handleCreateKey = () => {
    if (!selectedServerId) {
      toast({
        title: 'Error',
        description: 'Please select a server first',
        variant: 'destructive',
      })
      return
    }

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

  if (serversLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!servers || servers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for your servers</p>
        </div>
        <EmptyState
          icon={Key}
          title="No servers yet"
          description="Create a server first to manage API keys"
          action={{
            label: 'Create Server',
            onClick: () => router.push('/servers?create=1'),
          }}
        />
      </div>
    )
  }

  const selectedServer = servers.find((s) => s.id === selectedServerId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for your servers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Server</CardTitle>
              <CardDescription>Choose a server to view and manage its API keys</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreateKey} disabled={!selectedServerId || isCreating}>
                <Plus className="mr-2 h-4 w-4" />
                {isCreating ? 'Creating...' : 'Create Key'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedServerId && (
        <>
          {showNewKey && createdApiKey && (
            <Card className="border-primary">
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
                  <Button size="sm" variant="outline" onClick={() => setShowNewKey(false)}>
                    Dismiss
                  </Button>
                </div>
                {createdApiKeyInfo && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Key ID: <span className="font-mono">{createdApiKeyInfo.id}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>API Keys for {selectedServer?.name}</CardTitle>
              <CardDescription>
                View to{' '}
                <Link
                  href={`/servers/${selectedServerId}/settings`}
                  className="text-primary hover:underline"
                >
                  settings
                </Link>{' '}
                to manage this server
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{key.id.slice(0, 8)}…</span>
                                <CopyButton value={key.id} />
                              </div>
                              {key.name && (
                                <div className="text-xs text-muted-foreground">{key.name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(key.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.revokedAt ? 'destructive' : 'secondary'}>
                              {key.revokedAt ? 'Revoked' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!key.revokedAt && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRevokeKey(key.id)}
                                disabled={isRevoking}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border">
                  <p className="text-sm text-muted-foreground">No API keys for this server</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedServerId && servers.length > 0 && (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">Select a server to view its API keys</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
