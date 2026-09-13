import { z } from 'zod'

export const createServerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
})

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
})

export const metricsFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).optional(),
})

export type CreateServerInput = z.infer<typeof createServerSchema>
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>
export type MetricsFilters = z.infer<typeof metricsFiltersSchema>
