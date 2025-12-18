export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'MCP Metrics Platform'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SERVERS: '/servers',
  SERVER_DETAIL: (id: string) => `/servers/${id}`,
  SERVER_METRICS: (id: string) => `/servers/${id}/metrics`,
  SERVER_ANALYTICS: (id: string) => `/servers/${id}/analytics`,
  SERVER_SETTINGS: (id: string) => `/servers/${id}/settings`,
  API_KEYS: '/apikeys',
} as const

export const QUERY_KEYS = {
  AUTH: ['auth', 'me'],
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

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  THEME: 'theme',
} as const
