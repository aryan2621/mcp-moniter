import { useApiClient } from '../use-api-client'
import type { LogoSize } from '@/lib/constants'

export type CompanySettings = {
  companyName: string
  companyDescription: string
  logoDataUrl: string | null
  logoSize: LogoSize
}

export function useSettingsApi() {
  const apiClient = useApiClient()

  return {
    getSettings: () => apiClient.get('settings').json<CompanySettings>(),
    updateSettings: (body: CompanySettings) =>
      apiClient.put('settings', { json: body }).json<CompanySettings>(),
  }
}
