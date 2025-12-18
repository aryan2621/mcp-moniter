import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { serversApi } from '@/lib/api/endpoints/servers'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateServerInput } from '@/lib/validators'
import { useRouter } from 'next/navigation'

export function useServers() {
  const queryClient = useQueryClient()

  const {
    data: servers,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.SERVERS,
    queryFn: serversApi.getServers,
  })

  const createMutation = useMutation({
    mutationFn: serversApi.createServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVERS })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateServerInput> }) =>
      serversApi.updateServer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVER(variables.id) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: serversApi.deleteServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SERVERS })
    },
  })

  return {
    servers,
    isLoading,
    error,
    createServer: createMutation.mutate,
    updateServer: updateMutation.mutate,
    deleteServer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useServer(id: string) {
  const {
    data: server,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.SERVER(id),
    queryFn: () => serversApi.getServer(id),
    enabled: !!id,
  })

  return { server, isLoading, error }
}
