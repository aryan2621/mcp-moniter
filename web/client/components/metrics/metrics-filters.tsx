'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MetricsFiltersProps {
  onFilter: (filters: { startDate?: string; endDate?: string }) => void
  onClose?: () => void
  variant?: 'inline' | 'drawer'
}

export function MetricsFilters({ onFilter, onClose, variant = 'inline' }: MetricsFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const apply = () => {
    onFilter({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
    onClose?.()
  }

  const reset = () => {
    setStartDate('')
    setEndDate('')
    onFilter({})
    onClose?.()
  }

  const hasValues = startDate || endDate

  if (variant === 'drawer') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="filter-start">From</Label>
          <Input
            id="filter-start"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-end">To</Label>
          <Input
            id="filter-end"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={apply} className="flex-1">
            Apply
          </Button>
          <Button variant="outline" onClick={reset} className="flex-1">
            Reset
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="datetime-local"
        aria-label="From date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="h-9 w-[160px]"
      />
      <Input
        type="datetime-local"
        aria-label="To date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="h-9 w-[160px]"
      />
      <Button size="sm" variant="secondary" onClick={apply} className="h-9">
        Apply
      </Button>
      {hasValues && (
        <Button size="sm" variant="ghost" onClick={reset} className="h-9">
          Reset
        </Button>
      )}
    </div>
  )
}
