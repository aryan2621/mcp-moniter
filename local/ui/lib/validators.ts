import { z } from 'zod'

export const connectionSchema = z.object({
  serverUrl: z.string().url('Enter a valid server URL'),
  instanceSecret: z.string().min(16, 'Instance secret must be at least 16 characters'),
})

export const metricsFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export type ConnectionInput = z.infer<typeof connectionSchema>
export type MetricsFilters = z.infer<typeof metricsFiltersSchema>
