import { apiClient } from '../client'
import type { User, LoginResponse } from '@/types'
import type { LoginInput, RegisterInput } from '@/lib/validators'

export const authApi = {
  async register(data: RegisterInput): Promise<LoginResponse> {
    return apiClient.post('auth/register', { json: data }).json<LoginResponse>()
  },

  async login(data: LoginInput): Promise<LoginResponse> {
    return apiClient.post('auth/login', { json: data }).json<LoginResponse>()
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get('auth/me').json<User>()
  },

  async logout(): Promise<{ success: boolean }> {
    return apiClient.post('auth/logout').json<{ success: boolean }>()
  },
}
