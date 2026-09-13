'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { hasConnection } from '@/lib/connection'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!hasConnection()) {
      router.replace('/connect')
      setAllowed(false)
      return
    }
    setAllowed(true)
  }, [router])

  if (!allowed) {
    return null
  }

  return <AppLayout>{children}</AppLayout>
}
