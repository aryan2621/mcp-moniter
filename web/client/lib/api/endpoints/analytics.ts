import { apiClient } from '../client'
import type { OverviewStats, PerformanceMetric, ToolUsage, ErrorAnalytics, GlobalOverviewStats } from '@/types'

export const analyticsApi = {
  async getOverview(
    serverId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<OverviewStats> {
    const searchParams = new URLSearchParams()
    if (filters?.startDate) searchParams.set('startDate', filters.startDate)
    if (filters?.endDate) searchParams.set('endDate', filters.endDate)

    return apiClient
      .get(`analytics/servers/${serverId}/overview`, { searchParams })
      .json<OverviewStats>()
  },

  async getPerformance(
    serverId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<PerformanceMetric[]> {
    const searchParams = new URLSearchParams()
    if (filters?.startDate) searchParams.set('startDate', filters.startDate)
    if (filters?.endDate) searchParams.set('endDate', filters.endDate)

    return apiClient
      .get(`analytics/servers/${serverId}/performance`, { searchParams })
      .json<PerformanceMetric[]>()
  },

  async getToolUsage(
    serverId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<ToolUsage[]> {
    const searchParams = new URLSearchParams()
    if (filters?.startDate) searchParams.set('startDate', filters.startDate)
    if (filters?.endDate) searchParams.set('endDate', filters.endDate)

    return apiClient
      .get(`analytics/servers/${serverId}/tools`, { searchParams })
      .json<ToolUsage[]>()
  },

  async getErrors(
    serverId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<ErrorAnalytics[]> {
    const searchParams = new URLSearchParams()
    if (filters?.startDate) searchParams.set('startDate', filters.startDate)
    if (filters?.endDate) searchParams.set('endDate', filters.endDate)

    return apiClient
      .get(`analytics/servers/${serverId}/errors`, { searchParams })
      .json<ErrorAnalytics[]>()
  },

  async getGlobalOverview(): Promise<GlobalOverviewStats> {
    return apiClient.get('analytics/overview').json<GlobalOverviewStats>()
  },
}
