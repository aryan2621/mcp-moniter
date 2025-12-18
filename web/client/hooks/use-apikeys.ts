import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi } from '@/lib/api/endpoints/apikeys'
import { QUERY_KEYS } from '@/lib/constants'
import type { CreateApiKeyInput } from '@/lib/validators'

export function useApiKeys(serverId: string) {
  const queryClient = useQueryClient()

  const {
    data: apiKeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.API_KEYS(serverId),
    queryFn: () => apiKeysApi.getApiKeys(serverId),
    enabled: !!serverId,
  })

  const createMutation = useMutation({
    mutationFn: (data?: CreateApiKeyInput) => apiKeysApi.createApiKey(serverId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(serverId) })
    },
  })

  const revokeMutation = useMutation({
    mutationFn: apiKeysApi.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.API_KEYS(serverId) })
    },
  })

  return {
    apiKeys,
    isLoading,
    error,
    createApiKey: createMutation.mutate,
    revokeApiKey: revokeMutation.mutate,
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
    createdApiKey: createMutation.data?.apiKey,
    createdApiKeyInfo: createMutation.data?.keyInfo,
  }
}
