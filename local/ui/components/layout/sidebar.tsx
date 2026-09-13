'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, Server, Activity, BarChart } from 'lucide-react'
import { cn, stripTrailingSlash } from '@/lib/utils'
import { useUiStore } from '@/store/ui-store'
import { Suspense } from 'react'

function SidebarNav() {
  const pathname = stripTrailingSlash(usePathname())
  const searchParams = useSearchParams()
  const { sidebarOpen } = useUiStore()
  const serverId = searchParams.get('id')

  if (!sidebarOpen) return null

  const mainRoutes = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Servers', icon: Server, href: '/servers' },
  ]

  const serverSubRoutes = serverId
    ? [
        { label: 'Analytics', href: `/servers/view?id=${serverId}`, icon: BarChart },
        { label: 'Metrics', href: `/servers/view/metrics?id=${serverId}`, icon: Activity },
      ]
    : []

  return (
    <aside className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {mainRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === route.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}

            {serverSubRoutes.length > 0 && (
              <div className="mt-2 space-y-1 border-l ml-5 pl-2">
                {serverSubRoutes.map((route) => {
                  const active =
                    route.href.includes('/metrics')
                      ? pathname.startsWith('/servers/view/metrics')
                      : pathname === '/servers/view'
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        'flex items-center gap-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <route.icon className="h-4 w-4 text-muted-foreground/70" />
                      {route.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarNav />
    </Suspense>
  )
}
