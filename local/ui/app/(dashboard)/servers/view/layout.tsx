'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useServer } from '@/hooks/use-servers'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NoDataFound } from '@/components/common/no-data-found'
import { formatDate, isServerActive } from '@/lib/utils'
import { ServerCrash } from 'lucide-react'

function ServerHeader({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || ''
  const { server, isLoading: serverLoading, error } = useServer(id)

  if (!id) {
    return (
      <NoDataFound
        icon={ServerCrash}
        title="No server selected"
        description="Pick a server from the list."
        variant="standalone"
        action={{ label: 'Back to Servers', href: '/servers' }}
      />
    )
  }

  if (serverLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <NoDataFound
        icon={ServerCrash}
        title="Couldn't load server"
        description="Check the API connection and try again."
        variant="standalone"
        action={{ label: 'Back to Servers', href: '/servers' }}
      />
    )
  }

  if (!server) {
    return (
      <NoDataFound
        icon={ServerCrash}
        title="Server not found"
        description="This server may have been deleted."
        variant="standalone"
        action={{ label: 'Back to Servers', href: '/servers' }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{server.name}</h2>
          <Badge variant={isServerActive(server.lastSeenAt) ? 'secondary' : 'outline'}>
            {isServerActive(server.lastSeenAt) ? 'Active' : server.lastSeenAt ? 'Stale' : 'Never'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Created {formatDate(server.createdAt)}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ServerHeader>{children}</ServerHeader>
    </Suspense>
  )
}
