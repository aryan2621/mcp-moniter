'use client'

import { useMemo, useSyncExternalStore } from 'react'
import ky, { type KyInstance } from 'ky'
import {
  getConnection,
  subscribeConnection,
  apiBaseUrl,
} from '@/lib/connection'

export function useApiClient(): KyInstance {
  const connection = useSyncExternalStore(
    subscribeConnection,
    getConnection,
    () => null
  )

  return useMemo(
    () =>
      ky.create({
        prefixUrl: `${apiBaseUrl(connection)}/v1`,
        hooks: {
          beforeRequest: [
            (request) => {
              const current = getConnection()
              if (current?.instanceSecret) {
                request.headers.set('X-Instance-Secret', current.instanceSecret)
              }
            },
          ],
        },
      }),
    [connection?.serverUrl, connection?.instanceSecret]
  )
}
