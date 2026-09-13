import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServersApi } from '@/lib/api/endpoints/servers'
import { QUERY_KEYS } from '@/lib/constants'
import { hasConnection } from '@/lib/connection'

export function useServers() {
  const queryClient = useQueryClient()
  const serversApi = useServersApi()

  const {
    data: servers,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.SERVERS,
    queryFn: serversApi.getServers,
    enabled: hasConnection(),
  })

  const deleteMutation = useMutation({
    mutationFn: serversApi.deleteServer,
    onSuccess: (_data, serverId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVER(serverId) })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })

  return {
    servers,
    isLoading,
    error,
    deleteServer: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}

export function useServer(id: string) {
  const serversApi = useServersApi()

  const {
    data: server,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.SERVER(id),
    queryFn: () => serversApi.getServer(id),
    enabled: !!id && hasConnection(),
  })

  return { server, isLoading, error }
}
