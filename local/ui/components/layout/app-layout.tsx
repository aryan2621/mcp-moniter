'use client'

import { Header } from './header'
import { Sidebar } from './sidebar'
import { useUiStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUiStore()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Sidebar />
        <main
          className={cn(
            'min-h-[calc(100vh-3.5rem)] transition-all',
            sidebarOpen ? 'pl-64' : 'pl-0'
          )}
        >
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
