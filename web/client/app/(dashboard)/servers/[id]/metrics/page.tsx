'use client'

import { use, useState } from 'react'
import { useServer } from '@/hooks/use-servers'
import { useMetrics } from '@/hooks/use-metrics'
import { MetricsTable } from '@/components/metrics/metrics-table'
import { MetricsFilters } from '@/components/metrics/metrics-filters'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { MetricsFilters as FiltersType } from '@/lib/validators'

export default function ServerMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { server } = useServer(id)
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end pt-2">
        <Button onClick={handleExport} disabled={!metrics || metrics.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <MetricsFilters onFilter={handleFilter} />

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
