import type { Server } from '@/types'
import type { CreateServerInput } from '@/lib/validators'
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

    async createServer(data: CreateServerInput): Promise<Server> {
      return apiClient.post('servers', { json: data }).json<Server>()
    },

    async updateServer(id: string, data: Partial<CreateServerInput>): Promise<Server> {
      return apiClient.patch(`servers/${id}`, { json: data }).json<Server>()
    },

    async deleteServer(id: string): Promise<void> {
      await apiClient.delete(`servers/${id}`)
    },
  }
}
