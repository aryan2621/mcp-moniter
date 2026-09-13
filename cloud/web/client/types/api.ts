import type { User, Server, ApiKey } from './models'

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface LoginResponse {
  user: User
}

export interface CreateServerResponse {
  server: Server
}

export interface CreateApiKeyResponse {
  apiKey: string
  keyInfo: Pick<ApiKey, 'id' | 'serverId' | 'name' | 'createdAt'>
  warning?: string
}
