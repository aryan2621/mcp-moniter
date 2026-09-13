'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { hasConnection } from '@/lib/connection'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace(hasConnection() ? '/dashboard' : '/connect')
  }, [router])

  return null
}
