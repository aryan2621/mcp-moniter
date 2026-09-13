'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getConnection, setConnection, apiBaseUrl } from '@/lib/connection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_DESCRIPTION, APP_NAME, DEFAULT_LOGO_SIZE, logoSizeStyle, type LogoSize } from '@/lib/constants'

type Branding = {
  companyName: string
  companyDescription: string
  logoDataUrl: string | null
  logoSize: LogoSize
}

function originFromInput(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export default function ConnectPage() {
  const router = useRouter()
  const existing = getConnection()
  const [serverUrl, setServerUrl] = useState(existing?.serverUrl ?? 'http://localhost:8000')
  const [instanceSecret, setInstanceSecret] = useState(existing?.instanceSecret ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [branding, setBranding] = useState<Branding | null>(null)

  useEffect(() => {
    const origin = originFromInput(serverUrl)
    if (!origin) {
      setBranding(null)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${origin}/v1/branding`)
        if (!response.ok) {
          throw new Error('branding unavailable')
        }
        const data = (await response.json()) as Branding
        if (!cancelled) {
          setBranding({
            companyName: data.companyName || APP_NAME,
            companyDescription: data.companyDescription || APP_DESCRIPTION,
            logoDataUrl: data.logoDataUrl ?? null,
            logoSize: data.logoSize || DEFAULT_LOGO_SIZE,
          })
        }
      } catch {
        if (!cancelled) {
          setBranding(null)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [serverUrl])

  const displayName = branding?.companyName || APP_NAME
  const displayDescription = branding?.companyDescription || APP_DESCRIPTION
  const logoDataUrl = branding?.logoDataUrl ?? null
  const markStyle = logoSizeStyle(branding?.logoSize)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)

    try {
      const url = new URL(serverUrl)
      const base = url.origin
      const response = await fetch(`${base}/health`)
      if (!response.ok) {
        throw new Error('Server health check failed')
      }

      const secret = instanceSecret.trim()
      const verify = await fetch(`${base}/v1/servers`, {
        headers: { 'X-Instance-Secret': secret },
      })
      if (verify.status === 401) {
        throw new Error('Instance secret was rejected')
      }
      if (!verify.ok) {
        throw new Error('Could not reach the API')
      }

      setConnection({ serverUrl: apiBaseUrl({ serverUrl: base, instanceSecret: secret }), instanceSecret: secret })
      router.replace('/dashboard')
    } catch (err) {
      setError((err as Error).message || 'Could not connect')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-center bg-muted/40 px-8 py-12 md:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt=""
              style={markStyle}
              className="shrink-0 rounded-2xl border bg-background object-contain"
            />
          ) : (
            <span
              style={markStyle}
              className="flex shrink-0 items-center justify-center rounded-2xl bg-primary font-bold leading-none text-primary-foreground"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{displayDescription}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-center px-8 py-12 md:px-16">
        <form className="mx-auto w-full max-w-md space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Connect</h2>
            <p className="text-sm text-muted-foreground">
              Enter this instance&apos;s server URL and secret. Data stays on that host.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serverUrl">Server URL</Label>
            <Input
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://monitor.internal.company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instanceSecret">Instance secret</Label>
            <Input
              id="instanceSecret"
              type="password"
              value={instanceSecret}
              onChange={(e) => setInstanceSecret(e.target.value)}
              minLength={16}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Connecting…' : 'Connect'}
          </Button>
        </form>
      </section>
    </div>
  )
}
