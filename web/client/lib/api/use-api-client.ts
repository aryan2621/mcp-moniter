'use client'

import { useAuth } from '@clerk/nextjs'
import { useMemo } from 'react'
import ky, { type KyInstance } from 'ky'
import { API_BASE_URL } from '@/lib/constants'

export function useApiClient(): KyInstance {
  const { getToken } = useAuth()

  return useMemo(() => ky.create({
    prefixUrl: `${API_BASE_URL}/v1`,
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await getToken()
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
        }
      ]
    }
  }), [getToken])
}
