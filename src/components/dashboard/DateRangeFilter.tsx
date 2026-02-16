'use client'

import { cn } from '@/lib/utils'

interface DateRangeFilterProps {
  value: number
  onChange: (days: number) => void
}

const ranges = [
  { days: 7, label: '7D' },
  { days: 14, label: '14D' },
  { days: 30, label: '30D' },
]

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {ranges.map(({ days, label }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            value === days
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
