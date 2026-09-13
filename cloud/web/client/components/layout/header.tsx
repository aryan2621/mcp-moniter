'use client'

import Link from 'next/link'
import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/store/ui-store'
import { UserButton } from '@clerk/nextjs'
import { APP_NAME } from '@/lib/constants'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useUiStore()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:mr-4">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="mr-4 flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{APP_NAME}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}
