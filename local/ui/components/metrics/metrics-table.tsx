'use client'

import { Metric } from '@/types'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDuration, formatBytes } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

interface MetricsTableProps {
  metrics: Metric[]
  isLoading?: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function pageNumbers(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const unique = new Set<number>([1, totalPages, current, current - 1, current + 1])
  const sorted = [...unique].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)
  const items: Array<number | 'ellipsis'> = []

  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      items.push('ellipsis')
    }
    items.push(sorted[i])
  }

  return items
}

export function MetricsTable({
  metrics,
  isLoading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pagination,
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

  const total = pagination?.total ?? 0
  const totalPages = Math.max(pagination?.totalPages ?? 0, total > 0 ? 1 : 0)
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={metrics}
        isLoading={isLoading}
        emptyMessage="No metrics found"
      />

      {pagination && (
        <div className="flex flex-col gap-3 border-t px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[72px]" aria-label="Rows per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading || totalPages === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            {pageNumbers(page, totalPages).map((item, index) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onPageChange(item)}
                  disabled={isLoading}
                >
                  {item}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || isLoading || totalPages === 0}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
