import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}m`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const ACTIVE_WINDOW_MS = 5 * 60 * 1000

export function isServerActive(
  lastSeenAt?: string | Date | null,
  withinMs = ACTIVE_WINDOW_MS
): boolean {
  if (!lastSeenAt) return false
  const seen = new Date(lastSeenAt).getTime()
  if (!Number.isFinite(seen)) return false
  return Date.now() - seen < withinMs
}

export function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1)
  }
  return path
}

export function csvEscape(value: unknown): string {
  const raw = String(value ?? '')
  const prefixed = /^[=+\-@]/.test(raw) ? `'${raw}` : raw
  return `"${prefixed.replace(/"/g, '""')}"`
}

export function dateSearchParams(filters?: {
  startDate?: string
  endDate?: string
}): URLSearchParams {
  const searchParams = new URLSearchParams()
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  return searchParams
}

export function last24hRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}
