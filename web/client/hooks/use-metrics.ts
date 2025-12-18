import { useQuery } from '@tanstack/react-query'
import { metricsApi } from '@/lib/api/endpoints/metrics'
import { QUERY_KEYS } from '@/lib/constants'
import type { MetricsFilters } from '@/lib/validators'

export function useMetrics(serverId: string, filters?: MetricsFilters) {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.METRICS(serverId, filters),
    queryFn: () => metricsApi.getMetrics(serverId, filters),
    enabled: !!serverId,
    refetchInterval: 30000,
  })

  return {
    metrics: data?.metrics,
    pagination: data?.pagination,
    isLoading,
    error
  }
}
