import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/endpoints/analytics'
import { QUERY_KEYS } from '@/lib/constants'

interface AnalyticsFilters {
  startDate?: string
  endDate?: string
}

export function useOverview(serverId: string, filters?: AnalyticsFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ANALYTICS(serverId, 'overview', filters),
    queryFn: () => analyticsApi.getOverview(serverId, filters),
    enabled: !!serverId,
  })

  return { overview: data, isLoading, error }
}

export function usePerformance(serverId: string, filters?: AnalyticsFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ANALYTICS(serverId, 'performance', filters),
    queryFn: () => analyticsApi.getPerformance(serverId, filters),
    enabled: !!serverId,
  })

  return { performance: data, isLoading, error }
}

export function useToolUsage(serverId: string, filters?: AnalyticsFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ANALYTICS(serverId, 'tools', filters),
    queryFn: () => analyticsApi.getToolUsage(serverId, filters),
    enabled: !!serverId,
  })

  return { toolUsage: data, isLoading, error }
}

export function useErrorAnalytics(serverId: string, filters?: AnalyticsFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.ANALYTICS(serverId, 'errors', filters),
    queryFn: () => analyticsApi.getErrors(serverId, filters),
    enabled: !!serverId,
  })

  return { errors: data, isLoading, error }
}

export function useGlobalOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.GLOBAL_ANALYTICS,
    queryFn: () => analyticsApi.getGlobalOverview(),
  })

  return { overview: data, isLoading, error }
}
