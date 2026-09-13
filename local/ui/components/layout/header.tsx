'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Moon, Plug, RefreshCw, Settings, Sun } from 'lucide-react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUiStore } from '@/store/ui-store'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { CompanySettingsForm } from '@/app/(dashboard)/settings/page'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUiStore()
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const { settings } = useSettings()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const companyName = settings?.companyName || APP_NAME
  const logoDataUrl = settings?.logoDataUrl

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:mr-4">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="mr-4 flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="" className="h-7 w-7 rounded-md object-contain" />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {companyName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="hidden font-bold sm:inline-block">{companyName}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh"
            disabled={isFetching > 0}
            onClick={() => {
              void queryClient.invalidateQueries()
            }}
          >
            <RefreshCw className={cn('h-5 w-5', isFetching > 0 && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Company settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/connect" aria-label="Connection settings">
              <Plug className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company</DialogTitle>
            <DialogDescription>
              Brand this instance. Empty fields use the MCP Monitor defaults.
            </DialogDescription>
          </DialogHeader>
          <CompanySettingsForm onSaved={() => setSettingsOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  )
}
