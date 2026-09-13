export const APP_NAME = 'MCP Monitor'
export const APP_DESCRIPTION =
  'Self-hosted observability for MCP servers. Track tool calls, latency, and errors on your own infrastructure.'

export const LOGO_SIZES = ['sm', 'md', 'lg', 'xl'] as const
export type LogoSize = (typeof LOGO_SIZES)[number]
export const DEFAULT_LOGO_SIZE: LogoSize = 'md'

const LOGO_PX: Record<LogoSize, { box: number; font: number }> = {
  sm: { box: 48, font: 20 },
  md: { box: 72, font: 28 },
  lg: { box: 96, font: 36 },
  xl: { box: 128, font: 48 },
}

export function logoSizeStyle(size?: string | null): {
  width: number
  height: number
  fontSize: number
} {
  const next = LOGO_PX[size as LogoSize] ?? LOGO_PX[DEFAULT_LOGO_SIZE]
  return { width: next.box, height: next.box, fontSize: next.font }
}

export const QUERY_KEYS = {
  SERVERS: ['servers'],
  SERVER: (id: string) => ['servers', id],
  METRICS: (serverId: string, filters?: object) => ['metrics', serverId, filters],
  ANALYTICS: (serverId: string, type: string, filters?: object) => [
    'analytics',
    serverId,
    type,
    filters,
  ],
  GLOBAL_ANALYTICS: ['analytics', 'global'],
  SETTINGS: ['settings'],
} as const

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
    color: 'hsl(var(--foreground))',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  itemStyle: { color: 'hsl(var(--foreground))' },
  labelStyle: { color: 'hsl(var(--foreground))' },
} as const
