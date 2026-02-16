'use client'

interface DateFilterProps {
  value: number
  onChange: (days: number) => void
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const options = [
    { label: '7 Days', value: 7 },
    { label: '14 Days', value: 14 },
    { label: '30 Days', value: 30 },
  ]

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
