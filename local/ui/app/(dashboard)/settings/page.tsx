'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/hooks/use-settings'
import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_LOGO_SIZE,
  LOGO_SIZES,
  logoSizeStyle,
  type LogoSize,
} from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const MAX_LOGO_BYTES = 512 * 1024
const SIZE_LABELS: Record<LogoSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  xl: 'Extra large',
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read logo'))
    reader.readAsDataURL(file)
  })
}

export function CompanySettingsForm({ onSaved }: { onSaved?: () => void }) {
  const { settings, isLoading, saveSettings, isSaving } = useSettings()
  const { toast } = useToast()
  const [companyName, setCompanyName] = useState(APP_NAME)
  const [companyDescription, setCompanyDescription] = useState(APP_DESCRIPTION)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState<LogoSize>(DEFAULT_LOGO_SIZE)

  useEffect(() => {
    if (!settings) return
    setCompanyName(settings.companyName)
    setCompanyDescription(settings.companyDescription)
    setLogoDataUrl(settings.logoDataUrl)
    setLogoSize(settings.logoSize || DEFAULT_LOGO_SIZE)
  }, [settings])

  const previewName = companyName.trim() || APP_NAME
  const previewDescription = companyDescription.trim() || APP_DESCRIPTION
  const markStyle = logoSizeStyle(logoSize)

  const onLogoChange = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_LOGO_BYTES) {
      toast({ title: 'Logo is too large', description: 'Use an image under 512KB.', variant: 'destructive' })
      return
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Choose a PNG, JPEG, WEBP, GIF, or SVG.', variant: 'destructive' })
      return
    }
    try {
      setLogoDataUrl(await readFileAsDataUrl(file))
    } catch (error) {
      toast({ title: 'Could not read logo', description: (error as Error).message, variant: 'destructive' })
    }
  }

  const onSave = async () => {
    try {
      await saveSettings({
        companyName: companyName.trim() || APP_NAME,
        companyDescription: companyDescription.trim() || APP_DESCRIPTION,
        logoDataUrl,
        logoSize,
      })
      toast({ title: 'Company settings saved' })
      onSaved?.()
    } catch (error) {
      toast({
        title: 'Save failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading company settings…</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col items-start gap-4 rounded-xl border bg-muted/30 p-6">
        {logoDataUrl ? (
          <img
            src={logoDataUrl}
            alt=""
            style={markStyle}
            className="shrink-0 rounded-xl border bg-background object-contain"
          />
        ) : (
          <span
            style={markStyle}
            className="flex shrink-0 items-center justify-center rounded-xl bg-primary font-bold leading-none text-primary-foreground"
          >
            {previewName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">{previewName}</h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{previewDescription}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company name</Label>
          <Input
            id="company-name"
            value={companyName}
            maxLength={80}
            placeholder={APP_NAME}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-description">Description</Label>
          <textarea
            id="company-description"
            value={companyDescription}
            maxLength={400}
            rows={4}
            placeholder={APP_DESCRIPTION}
            onChange={(e) => setCompanyDescription(e.target.value)}
            className={cn(
              'flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-logo">Logo</Label>
          <Input
            id="company-logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={(e) => void onLogoChange(e.target.files?.[0])}
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none">Logo size</legend>
          <div className="grid grid-cols-2 gap-2">
            {LOGO_SIZES.map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <input
                  type="radio"
                  name="company-logo-size"
                  value={size}
                  checked={logoSize === size}
                  onChange={() => setLogoSize(size)}
                />
                {SIZE_LABELS[size]}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex gap-2">
          <Button onClick={() => void onSave()} disabled={isSaving}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || !logoDataUrl}
            onClick={() => setLogoDataUrl(null)}
          >
            Use default logo
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])
  return null
}
