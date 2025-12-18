export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

export interface Server {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
}

export interface ApiKey {
  id: string
  name?: string
  serverId: string
  createdAt: string
  lastUsedAt?: string
  revokedAt?: string
  isActive?: boolean
}

export interface Metric {
  id: string
  serverId: string
  callId: string
  toolName: string
  duration: number
  inputSize: number
  outputSize: number
  success: boolean
  error?: string
  errorStack?: string
  timestamp: string
}

export interface OverviewStats {
  totalCalls: number
  successRate: number
  avgDuration: number
  errorRate: number
}

export interface GlobalOverviewStats {
  totalServers: number
  totalApiKeys: number
  totalMetrics: number
  errorRate: number
}

export interface PerformanceMetric {
  timestamp: string
  avgDuration: number
  p95Duration: number
  p99Duration: number
}

export interface ToolUsage {
  toolName: string
  count: number
  avgDuration: number
}

export interface ErrorAnalytics {
  errorMessage: string
  count: number
  lastOccurred: string
}
