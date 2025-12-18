import { apiClient } from '../client'
import type { ApiKey, CreateApiKeyResponse } from '@/types'
import type { CreateApiKeyInput } from '@/lib/validators'

export const apiKeysApi = {
  async getApiKeys(serverId: string): Promise<ApiKey[]> {
    const res = await apiClient.get(`servers/${serverId}/keys`).json<{ keys: ApiKey[] }>()
    return res.keys
  },

  async createApiKey(serverId: string, data?: CreateApiKeyInput): Promise<CreateApiKeyResponse> {
    return apiClient
      .post(`servers/${serverId}/keys`, { json: data || {} })
      .json<CreateApiKeyResponse>()
  },

  async revokeApiKey(id: string): Promise<void> {
    await apiClient.delete(`keys/${id}`)
  },
}
