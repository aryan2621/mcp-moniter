import type { OverviewStats, PerformanceMetric, ToolUsage, ErrorAnalytics, GlobalOverviewStats } from '@/types'
import { dateSearchParams } from '@/lib/utils'
import { useApiClient } from '../use-api-client'

export function useAnalyticsApi() {
  const apiClient = useApiClient()

  return {
    async getOverview(
      serverId: string,
      filters?: { startDate?: string; endDate?: string }
    ): Promise<OverviewStats> {
      return apiClient
        .get(`analytics/servers/${serverId}/overview`, {
          searchParams: dateSearchParams(filters),
        })
        .json<OverviewStats>()
    },

    async getPerformance(
      serverId: string,
      filters?: { startDate?: string; endDate?: string }
    ): Promise<PerformanceMetric[]> {
      return apiClient
        .get(`analytics/servers/${serverId}/performance`, {
          searchParams: dateSearchParams(filters),
        })
        .json<PerformanceMetric[]>()
    },

    async getToolUsage(
      serverId: string,
      filters?: { startDate?: string; endDate?: string }
    ): Promise<ToolUsage[]> {
      return apiClient
        .get(`analytics/servers/${serverId}/tools`, {
          searchParams: dateSearchParams(filters),
        })
        .json<ToolUsage[]>()
    },

    async getErrors(
      serverId: string,
      filters?: { startDate?: string; endDate?: string }
    ): Promise<ErrorAnalytics[]> {
      return apiClient
        .get(`analytics/servers/${serverId}/errors`, {
          searchParams: dateSearchParams(filters),
        })
        .json<ErrorAnalytics[]>()
    },

    async getGlobalOverview(): Promise<GlobalOverviewStats> {
      return apiClient.get('analytics/overview').json<GlobalOverviewStats>()
    },
  }
}
