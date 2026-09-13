import type { Server } from '@/types'
import { useApiClient } from '../use-api-client'

export function useServersApi() {
  const apiClient = useApiClient()

  return {
    async getServers(): Promise<Server[]> {
      return apiClient.get('servers').json<Server[]>()
    },

    async getServer(id: string): Promise<Server> {
      return apiClient.get(`servers/${id}`).json<Server>()
    },

    async deleteServer(id: string): Promise<void> {
      await apiClient.delete(`servers/${id}`)
    },
  }
}
