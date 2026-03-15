'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NoDataFoundProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  variant?: 'standalone' | 'inline'
  className?: string
}

export function NoDataFound({
  title,
  description,
  icon: Icon = Inbox,
  action,
  variant = 'standalone',
  className,
}: NoDataFoundProps) {
  const isInline = variant === 'inline'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isInline
          ? 'rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 py-10 px-6'
          : 'rounded-xl border border-dashed border-muted-foreground/25 bg-gradient-to-b from-muted/40 to-muted/20 p-10',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10',
          isInline ? 'mb-3 h-12 w-12' : 'mb-5 h-14 w-14'
        )}
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            isInline ? 'h-6 w-6' : 'h-7 w-7'
          )}
          strokeWidth={1.5}
        />
      </div>
      <h3
        className={cn(
          'font-medium text-foreground',
          isInline ? 'text-sm' : 'text-base'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-muted-foreground',
            isInline ? 'mt-1 text-xs' : 'mt-2 max-w-sm text-sm'
          )}
        >
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Button variant="outline" size={isInline ? 'sm' : 'default'} className="mt-4" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size={isInline ? 'sm' : 'default'}
            className="mt-4"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
