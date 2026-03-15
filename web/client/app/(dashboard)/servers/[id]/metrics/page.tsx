'use client'

import { use, useState } from 'react'
import { useMetrics } from '@/hooks/use-metrics'
import { MetricsTable } from '@/components/metrics/metrics-table'
import { MetricsFilters } from '@/components/metrics/metrics-filters'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Download, Filter } from 'lucide-react'
import { MetricsFilters as FiltersType } from '@/lib/validators'

export default function ServerMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<FiltersType>({})
  const { metrics, pagination, isLoading } = useMetrics(id, { ...filters, page })

  const handleFilter = (newFilters: FiltersType) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleExport = () => {
    if (!metrics) return
    const csv = [
      ['Timestamp', 'Tool', 'Duration', 'Input Size', 'Output Size', 'Success', 'Error'].join(','),
      ...metrics.map((m) =>
        [
          m.timestamp,
          m.toolName,
          m.duration,
          m.inputSize,
          m.outputSize,
          m.success,
          m.error || '',
        ].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metrics-${id}-${Date.now()}.csv`
    a.click()
  }

  const hasData = !isLoading && pagination && pagination.total > 0
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-nowrap items-center justify-between gap-3 pt-2">
        <h3 className="m-0 text-lg font-semibold leading-none">Metrics</h3>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setFilterOpen(true)}
            aria-label="Filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleExport}
            disabled={!hasData || !metrics || metrics.length === 0}
            aria-label="Export CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter metrics by date range</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <MetricsFilters
              variant="drawer"
              onFilter={handleFilter}
              onClose={() => setFilterOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <MetricsTable 
        metrics={metrics || []} 
        isLoading={isLoading} 
        page={page}
        onPageChange={setPage}
        pagination={pagination}
      />
    </div>
  )
}
