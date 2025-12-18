'use client'

import { Metric } from '@/types'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDuration, formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

interface MetricsTableProps {
  metrics: Metric[]
  isLoading?: boolean
  page: number
  onPageChange: (page: number) => void
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function MetricsTable({ 
  metrics, 
  isLoading, 
  page, 
  onPageChange, 
  pagination 
}: MetricsTableProps) {
  const columns = [
    {
      header: 'Timestamp',
      cell: (metric: Metric) => <span className="text-sm">{formatDateTime(metric.timestamp)}</span>,
    },
    {
      header: 'Tool',
      cell: (metric: Metric) => <Badge variant="secondary">{metric.toolName}</Badge>,
    },
    {
      header: 'Duration',
      cell: (metric: Metric) => (
        <span className="font-mono text-sm">{formatDuration(metric.duration)}</span>
      ),
    },
    {
      header: 'Input',
      cell: (metric: Metric) => (
        <span className="text-sm text-muted-foreground">{formatBytes(metric.inputSize)}</span>
      ),
    },
    {
      header: 'Output',
      cell: (metric: Metric) => (
        <span className="text-sm text-muted-foreground">{formatBytes(metric.outputSize)}</span>
      ),
    },
    {
      header: 'Status',
      cell: (metric: Metric) => (
        <div className="flex items-center gap-2">
          {metric.success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-success">Success</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">Error</span>
            </>
          )}
        </div>
      ),
    },
    {
      header: 'Error',
      cell: (metric: Metric) => (
        <span className="text-sm text-muted-foreground">{metric.error || '-'}</span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={metrics}
        isLoading={isLoading}
        emptyMessage="No metrics found"
      />
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pagination.totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
