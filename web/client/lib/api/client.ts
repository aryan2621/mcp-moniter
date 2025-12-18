import ky, { type KyInstance } from 'ky'
import { API_BASE_URL } from '@/lib/constants'

export const apiClient: KyInstance = ky.create({
  prefixUrl: `${API_BASE_URL}/v1`,
  credentials: 'include', // Ensure cookies are sent with requests
})
