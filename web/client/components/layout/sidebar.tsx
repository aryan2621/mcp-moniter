'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Server, Key, Activity, BarChart, Settings, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/ui-store'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen } = useUiStore()

  if (!sidebarOpen) return null

  const serverMatch = pathname.match(/^\/servers\/([^/]+)/)
  const serverId = serverMatch ? serverMatch[1] : null

  const isServerSubPage = (href: string) => {
    if (href === `/servers/${serverId}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const mainRoutes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Servers',
      icon: Server,
      href: '/servers',
    },
  ]

  const serverSubRoutes = serverId ? [
    { label: 'Overview', href: `/servers/${serverId}`, icon: ChevronRight },
    { label: 'Metrics', href: `/servers/${serverId}/metrics`, icon: Activity },
    { label: 'Analytics', href: `/servers/${serverId}/analytics`, icon: BarChart },
    { label: 'Settings', href: `/servers/${serverId}/settings`, icon: Settings },
  ] : []

  const bottomRoutes = [
    {
      label: 'API Keys',
      icon: Key,
      href: '/apikeys',
    },
  ]

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
                {serverSubRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      'flex items-center gap-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isServerSubPage(route.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <route.icon className="h-4 w-4 text-muted-foreground/70" />
                    {route.label}
                  </Link>
                ))}
              </div>
            )}

            {bottomRoutes.map((route) => (
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
          </div>
        </div>
      </div>
    </aside>
  )
}
