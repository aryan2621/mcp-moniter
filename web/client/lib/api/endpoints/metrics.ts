import { apiClient } from '../client'
import type { Metric } from '@/types'
import type { MetricsFilters } from '@/lib/validators'

export const metricsApi = {
  async getMetrics(
    serverId: string,
    filters?: MetricsFilters
  ): Promise<{ metrics: Metric[]; pagination: any }> {
    const searchParams = new URLSearchParams()
    if (filters?.startDate) searchParams.set('startDate', filters.startDate)
    if (filters?.endDate) searchParams.set('endDate', filters.endDate)
    if (filters?.page) searchParams.set('page', filters.page.toString())

    const res = await apiClient
      .get(`metrics/servers/${serverId}`, { searchParams })
      .json<{
        serverId: string
        metrics: any[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>()

    const metrics = (res.metrics || []).map((m) => ({
      id: m.id || m._id || m.callId,
      serverId: m.serverId,
      toolName: m.toolName,
      duration: m.duration,
      inputSize: m.inputSize,
      outputSize: m.outputSize ?? 0,
      success: m.success,
      errorMessage: m.error,
      timestamp:
        typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString(),
    })) as Metric[]

    return {
      metrics,
      pagination: res.pagination,
    }
  },
}
