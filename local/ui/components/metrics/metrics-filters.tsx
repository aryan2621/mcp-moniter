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

function startOfDayIso(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString()
}

function endOfDayIso(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString()
}

const dateInputClass =
  'min-w-0 [color-scheme:inherit] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80'

export function MetricsFilters({ onFilter, onClose, variant = 'inline' }: MetricsFiltersProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const apply = () => {
    onFilter({
      startDate: startDate ? startOfDayIso(startDate) : undefined,
      endDate: endDate ? endOfDayIso(endDate) : undefined,
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
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
            className={dateInputClass}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-end">To</Label>
          <Input
            id="filter-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
            className={dateInputClass}
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
        type="date"
        aria-label="From date"
        value={startDate}
        max={endDate || undefined}
        onChange={(e) => setStartDate(e.target.value)}
        className={`h-9 w-[160px] ${dateInputClass}`}
      />
      <Input
        type="date"
        aria-label="To date"
        value={endDate}
        min={startDate || undefined}
        onChange={(e) => setEndDate(e.target.value)}
        className={`h-9 w-[160px] ${dateInputClass}`}
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
