import { useQuery } from '@tanstack/react-query'
import { useMetricsApi } from '@/lib/api/endpoints/metrics'
import { QUERY_KEYS } from '@/lib/constants'
import type { MetricsFilters } from '@/lib/validators'
import { hasConnection } from '@/lib/connection'

export function useMetrics(serverId: string, filters?: MetricsFilters) {
  const metricsApi = useMetricsApi()

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.METRICS(serverId, filters),
    queryFn: () => metricsApi.getMetrics(serverId, filters),
    enabled: !!serverId && hasConnection(),
    refetchInterval: 30000,
  })

  return {
    metrics: data?.metrics,
    pagination: data?.pagination,
    isLoading,
    error
  }
}
