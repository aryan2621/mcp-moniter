'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Server, Plug } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button asChild className="w-full justify-start">
          <Link href="/servers">
            <Server className="mr-2 h-4 w-4" />
            View All Servers
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/connect">
            <Plug className="mr-2 h-4 w-4" />
            Connection settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
