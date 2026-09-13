'use client'

import { use } from 'react'
import { useServer } from '@/hooks/use-servers'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NoDataFound } from '@/components/common/no-data-found'
import { formatDate } from '../../../../lib/utils'
import { ServerCrash } from 'lucide-react'

export default function ServerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { server, isLoading: serverLoading } = useServer(id)

  if (serverLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!server) {
    return (
      <NoDataFound
        icon={ServerCrash}
        title="Server not found"
        description="This server may have been deleted or you don't have access to it."
        variant="standalone"
        action={{
          label: 'Back to Servers',
          href: '/servers',
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{server.name}</h2>
            <Badge variant="secondary">Active</Badge>
          </div>
          <p className="text-muted-foreground">{server.description || 'No description'}</p>
          <p className="text-sm text-muted-foreground">Created {formatDate(server.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}
