import Link from 'next/link'
import { Server as ServerType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Server, Settings, BarChart } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ServerCardProps {
  server: ServerType
  onEdit: (server: ServerType) => void
  onDelete: (serverId: string) => void
}

export function ServerCard({ server, onEdit, onDelete }: ServerCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{server.name}</CardTitle>
            <CardDescription className="text-xs">
              Created {formatDate(server.createdAt)}
            </CardDescription>
          </div>
        </div>
        <Badge variant="secondary">Active</Badge>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {server.description || 'No description'}
        </p>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/servers/${server.id}`}>
              <BarChart className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(server)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
