import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSettingsApi, type CompanySettings } from '@/lib/api/endpoints/settings'
import { QUERY_KEYS } from '@/lib/constants'
import { hasConnection } from '@/lib/connection'

export function useSettings() {
  const settingsApi = useSettingsApi()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.SETTINGS,
    queryFn: settingsApi.getSettings,
    enabled: hasConnection(),
  })

  const saveMutation = useMutation({
    mutationFn: (body: CompanySettings) => settingsApi.updateSettings(body),
    onSuccess: (settings) => {
      queryClient.setQueryData(QUERY_KEYS.SETTINGS, settings)
    },
  })

  return {
    settings: data,
    isLoading,
    error,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  }
}
