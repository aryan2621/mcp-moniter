export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME!

const isProd =
  process.env.NODE_ENV === 'production' ||
  process.env.ENVIRONMENT === 'production'
export const API_BASE_URL = isProd
  ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? '')
  : (process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL ?? 'http://localhost:8000')

export const QUERY_KEYS = {
  SERVERS: ['servers'],
  SERVER: (id: string) => ['servers', id],
  API_KEYS: (serverId: string) => ['apikeys', serverId],
  METRICS: (serverId: string, filters?: Record<string, any>) => ['metrics', serverId, filters],
  ANALYTICS: (serverId: string, type: string, filters?: Record<string, any>) => [
    'analytics',
    serverId,
    type,
    filters,
  ],
  GLOBAL_ANALYTICS: ['analytics', 'global'],
} as const
